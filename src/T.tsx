import { get } from 'lodash';
import { useTranslationWithDescription } from './useTranslationWithDescription';
import React, { useEffect, useState } from 'react';
import { getConfig } from './Initialize';


type Concat<K extends string, P extends string> = `${K}${'' extends P ? '' : '.'}${P}`;
type ConcatColon<K extends string, P extends string> = `${K}${'' extends P ? '' : ':'}${P}`;
type Level5Keys<T> = T extends object ? keyof T & string : '';
type Level4Keys<T> = T extends object ? {
  [K in keyof T]-?: Concat<K & string, Level5Keys<T[K]>>;
}[keyof T] : '';
type Level3Keys<T> = T extends object ? {
  [K in keyof T]-?: Concat<K & string, Level4Keys<T[K]>>;
}[keyof T] : '';
type Level2Keys<T> = T extends object ? {
  [K in keyof T]-?: Concat<K & string, Level3Keys<T[K]>>;
}[keyof T] : '';
type Level1Keys<T> = T extends object ? {
  [K in keyof T]-?: ConcatColon<K & string, Level2Keys<T[K]>>;
}[keyof T] : '';

export type TranslationNamespaces<T> = keyof T;
export type TranslationKeys<T> = Level1Keys<T>;

const EditHoverButton = (props:React.ComponentProps<'button'>) => 
{
	const [hover, setHover] = useState(false);
	return <button onMouseOver={() => setHover(true)} onMouseUp={() => setHover(false)} 
		style={{
			width: 14, 
			height: 14, 
			padding: 1,
			margin: 0,
			position: 'absolute',
			background: '#fff',
			color: '#000',
			borderRadius: 4,
			border: '1px solid black',
			cursor: 'pointer',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			opacity: hover ? 1 : 0.5,
			...props.style
		}} {...props} />;
};

/**
 * Display a translated string.
 *
 * @param props Component Props
 * @param props.key The translation key
 * @param props.'data-testid' A test identifier. If not provided, the translation key will be used.
 * @returns A span element with the content being a translated string.
 */
export function T<TranslationDescriptions>(props: {
  tkey: TranslationKeys<TranslationDescriptions>;
  interpolation?: Record<string, string>;
  'data-testid'?: string;
  style?: React.CSSProperties;
  translationKeys: TranslationDescriptions
}) 
{
	const config = getConfig();
	const { t } = useTranslationWithDescription();
	const [ ns, keyText ]= props.tkey.split(':');
	const description = get(props.translationKeys[ns as TranslationNamespaces<TranslationDescriptions>], keyText);
	const translated = t(props.tkey, description, props.interpolation);

	const showTranslateUi = config.showInlineEdit && config.phraseProjectId && config.phraseAccessToken && config.phraseAccountId;
	const [keyId, setKeyId] = useState<string>();
	useEffect(() => 
	{
		if (!showTranslateUi || !config.canTranslate)
		{
			return;
		}

		const execute = async () => 
		{
			const listing = await fetch(`https://api.phrase.com/v2/projects/${config.phraseProjectId}/keys/search?access_token=${config.phraseAccessToken}`, 
				{
					method: 'POST',
					body: JSON.stringify({ q: keyText }),
					headers: {
						'Content-Type': 'application/json',
					},
				});
			const results = await listing.json();
			const match: string = results.find((r: any) => r.name === props.tkey)?.id;
			if (match)
			{
				setKeyId(match);
			}
		};
		execute();
	}, [ns, keyText, showTranslateUi, props.tkey]);

	const launchPhrase = () => 
	{
		window.open(`https://app.phrase.com/editor/v4/accounts/${config.phraseAccountId}/projects/${config.phraseProjectId}?keyId=`+keyId, '_blank');
	};

	return <span 
		data-translate-id={translated.tagId} 
		data-testid={props['data-testid'] ?? props.tkey} 
		key={props.tkey}>
		{
			showTranslateUi && keyId && <EditHoverButton 
				title={`Edit in Phrase: ${description}`}
				onClick={launchPhrase}
				style={{ 
          
				}}>
				{ editMiniIcon }
			</EditHoverButton>
		}
		{translated.translated}
	</span>;
}

const editMiniIcon = <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" enableBackground="new 0 0 1000 1000" xmlSpace="preserve">
	<g>
		<path fill='#000' stroke='#000' d="M47.9,760.8C6.8,801.9,1.9,969.2,20,987.4c18.2,18,176.7-1.3,215-39.7C273.2,909.6,759.7,423,759.7,423l-187-187C572.7,236,89.1,719.7,47.9,760.8L47.9,760.8z"/>
		<path d="M803,5.8L628.5,180.2l187,187.1L990,192.8L803,5.8z"/>
	</g>
</svg>;
