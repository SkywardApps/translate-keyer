import { T } from './T';

export interface ITranslateKeyerConfig extends ITranslateKeyerParams {
  canTranslate?: boolean;
}

export interface ITranslateKeyerParams {
	shouldRequireDescription?: boolean;
	showInlineEdit?: boolean;
  phraseProjectId?: string;
  phraseAccessToken?: string;
  phraseAccountId?: string;
}

let config: Readonly<ITranslateKeyerConfig> = {
	showInlineEdit: false,
	shouldRequireDescription: false,
	canTranslate: false,
	phraseProjectId: '',
	phraseAccessToken: ''
};

export const initTranslateKeyer =  <TTranslationDescriptions extends Record<string, unknown>>(params: ITranslateKeyerParams, translateDescriptions: TTranslationDescriptions) => 
{
	const configured ={
		...params,
		canTranslate: Boolean(params.phraseAccessToken && params.phraseAccountId && params.phraseProjectId)
	};
	
	if(params.showInlineEdit && !(params.phraseProjectId && params.phraseAccountId && params.phraseAccessToken))
	{
		console.error();
		configured.showInlineEdit = false;
	}

	config = Object.freeze(configured);

	return (props: React.ComponentProps<typeof T<TTranslationDescriptions>>) => <T {...props} translationKeys={translateDescriptions} />;
};

export const getConfig = () => 
{
	return config;
};

