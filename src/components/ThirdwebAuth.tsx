import React from 'react';
import { inAppWallet } from 'thirdweb/wallets';
import { ConnectEmbed } from 'thirdweb/react';
import { client } from '../config/thirdweb';

const wallets = [
  inAppWallet({
    auth: {
      options: [
        'google',
        'apple',
        'discord',
        'email',
        'phone',
        'guest'
      ],
    },
    executionMode: {
      mode: 'EIP7702',
      sponsorGas: true,
    },
  }),
];

export function ThirdwebAuth() {
  return <ConnectEmbed client={client} wallets={wallets} />;
}
