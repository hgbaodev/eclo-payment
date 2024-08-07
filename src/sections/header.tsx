import Image from "next/image";
import React from "react";
import { ConnectButton, lightTheme } from "thirdweb/react";

const Header = ({img, wallets, sepolia, client }:{img: any, wallets: any, sepolia: any, client: any}) => {
  return (
    <div className="mb-3 flex justify-between items-center">
      <Image className="w-28" src={img} alt="Otona Logo" />
      <ConnectButton
        wallets={wallets}
        chain={sepolia}
        // chains={[ethereum, sepolia, arbitrum, bsc, otona]}
        theme={lightTheme({
          colors: { primaryButtonBg: "#2A4DD0" },
        })}
        client={client}
        connectModal={{
          size: "compact",
          titleIcon: "https://testnet.otoscan.io/assets/network_icon.png",
          showThirdwebBranding: false,
          title: "Otona",
          welcomeScreen: { title: "r" },
        }}
      />
    </div>
  );
};

export default Header;
