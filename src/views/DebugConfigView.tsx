import {Card, Input} from 'antd';
import React from 'react';
import {
    Configuration,
    ConfigurationDisplay, NoConfigurationError,
    parseConfiguration
} from '../components/ConfigurationDisplay/ConfigurationDisplay';

const defaultConfig: Configuration = {
    augmentationProportion: {
        name: 'Augmentation Proportion',
        description: 'Controls how much the given document is augmented. Value is interpreted as percentage!',
        type: 'integer',
        default: 100,
        min: 0,
        max: 300
    },
    augmentationStrategy: {
        name: 'Strategy',
        type: 'string',
        description: 'Strategy for selecting tokens to replace. Random will uniformly sample tokens, round robin will select every other token.',
        default: 'random',
        choices: ['random', 'round-robin']
    },
    beSmart: {
        name: 'Smart mode',
        type: 'boolean',
        description: "Don't be dumb, be smart instead.",
        default: false
    },
    messageToAugmentor: {
        name: 'Message to Augmentation Service',
        type: 'string',
        description: 'Something you always wanted to tell that pesky little microservice.',
        default: 'Why wont you just work??'
    },
    variance: {
        name: 'Variance in Semantics',
        type: 'float',
        description: 'How strongly the augmentation is allowed to deviate from the original semantics.',
        default: .1,
        min: 0,
        max: 1,
        step: .01
    }
}

export default function DebugConfigView() {
    const [configRaw, setConfigRaw] = React.useState<string>(JSON.stringify(defaultConfig, null, 2));
    const [config, setConfig] = React.useState<Configuration>(defaultConfig);

    React.useEffect(() => {
        try {
            const newConfig = parseConfiguration(JSON.parse(configRaw));
            setConfig(newConfig);
        } catch(e: unknown) {
            if(e instanceof SyntaxError) {
                // invalid json, maybe display something?
                return;
            }
            if(e instanceof NoConfigurationError) {
                // invalid config, maybe display error?
                return;
            }
            throw e;
        }
    }, [configRaw]);

    return (
        <div key={'debug-config-view'}>
            <Card>
                <Input.TextArea
                    autoSize={{maxRows: 20}}
                    value={configRaw}
                    onChange={(e) => setConfigRaw(e.target.value)}
                />
            </Card>

            <Card
                title={'Debug View for Dynamic Configurations'}
            >
                <ConfigurationDisplay
                    configuration={config}
                    onChange={(newConfig) => setConfig(newConfig)}
                />
            </Card>
        </div>
    );
}