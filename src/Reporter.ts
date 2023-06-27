import { getConfig } from './Initialize';
import { KeyMap } from './KeyMap';

export const missingKeyHandler = (lngs: readonly string[], originalNs: string, originalKey: string, fallbackValue: string, updateMissing: boolean, options: any) => 
{
	const config = getConfig();
	const parts = originalKey.split(':');
	const [ns, key] = parts;
	if (KeyMap?.[ns]?.[key])
	{
		if (!KeyMap[ns][key].reported && KeyMap[ns][key].description)
		{
			if (config.trackMissingLocalizations)
			{
				console.warn(`[auto-translate] Missing key with description: (${lngs}) [${ns}:${key}] [${KeyMap[ns][key].taggedId}] [${KeyMap[ns][key].description}]`);
			}
			KeyMap[ns][key].reported = true;
		}
	}
	else
	{
		const message = `[auto-translate] Missing key that was not used via useTranslationWithDescription: ${ns} ${key}`;
		console.error(message);
		if (config.shouldRequireDescription)
		{
			throw new Error(message);
		}
	}
};
