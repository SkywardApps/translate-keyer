import { TFunction, TOptions } from 'i18next';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import shorthash from 'short-hash-ts';
import { getConfig } from './Initialize';
import { KeyMap } from './KeyMap';

export type TranslationProxyFunction = (key: string, description?: string, options?: TOptions) => TranslationProxy;

/**
 * Hook for a specific translation key to return a stable translation and an auto-generated tag id.
 */
export const useTranslated = (key: string, description: string, options?: TOptions) =>
{
	const { t } = useTranslation();
	return translate(key, description, options, t);
};

/**
 * Hook to get a translation function that includes a stable translation and an auto-generated tag id.
 */
export const useTranslationWithDescription = () => 
{
	const { t, i18n, ready } = useTranslation();
	const tWrapper: TranslationProxyFunction = useCallback((key: string, description?: string, options?: TOptions) => 
	{
		return translate(key, description, options, t);
	}, [t]);

	return { t: tWrapper, i18n, ready };
};

class TranslationProxy 
{
	public constructor(ns: string, id: string, options: TOptions | undefined, t: TFunction, tagId: string)
	{
		this._ns = ns;
		this._id = id;
		this._key = `${ns}:${id}`;
		this._options = options;
		this._t = t;
		this._tagId = tagId;
	}

	private _tagRead = false;
	private _translationRead = 0;
	private _check: number | undefined;

	private readonly _ns: string;
	private readonly _id: string;
	private readonly _tagId: string;
	private readonly _key: string;
	private readonly _options: TOptions | undefined;
	private readonly _t: TFunction;

	private check()
	{
		const config = getConfig();

		if (!this._check && !KeyMap[this._ns][this._id].checked)
		{
			KeyMap[this._ns][this._id].checked = true;

			this._check = setTimeout(() => 
			{
				if (!this._tagRead) 
				{
					console.warn(`[auto-translate] The key ${this._key} was translated but the tag was never read.  You should attempt to apply the tag to the relevant html element as the "data-translate-id" attribute.`);
				}

				if (this._translationRead && !KeyMap[this._ns][this._id].description)
				{
					const errorMessage = `[auto-translate] You must provide a description to translate the key ${this._key}. It was translated ${this._translationRead} times.`;
					console.error(errorMessage);
					if (config.shouldRequireDescription)
					{
						throw new Error(errorMessage);
					}
				}
			}, 1000);
		}
	}

	public get tagId()
	{
		this._tagRead = true;
		this.check();
		return this._tagId;
	}

	public get translated()
	{    
		this._translationRead += 1;
		this.check();

		if (this._options) 
		{
			return this._t(this._key, this._options);
		}

		else 
		{
			return this._t(this._key);
		}
	}

	public toString()
	{
		return this.translated;
	}
}

/**
 *
 */
export const translate = (key: string, description: string | undefined, options: TOptions | undefined, t: TFunction) =>
{
	// Make sure we have an entry
	const [ns, id] = key.includes(':') ? key.split(':') : ['common', key];
	if (!KeyMap[ns]) 
	{
		KeyMap[ns] = {};
	}

	if (!KeyMap[ns][id]) 
	{
		const tag = shorthash.unique(key);
		KeyMap[ns][id] = {
			key,
			description: description,
			taggedId: tag,
			reported: false,
			checked: false,
		};
	}

	if (description && KeyMap[ns][id].description !== description) 
	{
		// Update if there wasn't a description before.
		if (KeyMap[ns][id].description === undefined) 
		{
			KeyMap[ns][id].description = description;
		}

		else 
		{
			throw new Error(`Translation key ${key} has multiple different descriptions: ${description} vs ${KeyMap[ns][id].description}`);
		}
	}

	return new TranslationProxy(ns, id, options, t, KeyMap[ns][id].taggedId);
};
