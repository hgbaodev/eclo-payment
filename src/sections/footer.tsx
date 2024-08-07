import React from "react";
import Image from "next/image";
import ethIcon from "@/../public/eth.png";
import arbIcon from "@/../public/arb.png";
import bscIcon from "@/../public/bsc.png";

const Footer = () => {
  return (
    <>
      <div className="mt-4 flex justify-center">
        <span className="border-r-2 px-2 text-xs text-gray-500">
          Provided by{" "}
          <a
            href="https://testnet.otoscan.io/"
            className="uppercase text-black"
          >
            Otona
          </a>
        </span>
        <span className="border-r-2 px-2 text-xs text-gray-500">Rules</span>
        <span className="px-2 text-xs text-gray-500">Privacy</span>
      </div>
      <div className="mt-4 flex justify-center">
        <span className=" px-2 text-xs text-gray-500">Support</span>
      </div>
      <div className="flex items-center justify-center mt-2">
        <Image className="mx-5 w-7" src={ethIcon} alt="Eth Logo" />
        <Image className="mx-5 w-7" src={arbIcon} alt="Arb Logo" />
        <Image className="mx-5 w-7" src={bscIcon} alt="Bsc Logo" />
      </div>
    </>
  );
};

export default Footer;
