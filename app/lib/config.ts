import { createConfig } from '@0xsequence/connect';

export const config = createConfig('waas' /*or, 'universal'*/, {
  projectAccessKey: '<your-project-access-key>',
  chainIds: [1, 137],
  defaultChainId: 1,
  appName: 'the hash pit',
  waasConfigKey: '<your-waas-config-key>', // for waas
  google: {
    clientId: '<your-google-client-id>',
  },
  walletConnect: {
    projectId: '<your-wallet-connect-project-id>',
  },
});
