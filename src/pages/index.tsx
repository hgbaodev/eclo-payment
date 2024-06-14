import { Inter } from "next/font/google";
import Image from "next/image";
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendAndConfirmTransaction,
  toWei,
} from "thirdweb";
import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { IoIosMore } from "react-icons/io";
import { createWallet, walletConnect } from "thirdweb/wallets";
import { readContract } from "thirdweb";
import { useEffect, useState } from "react";
import { sepolia } from "thirdweb/chains";
import { FaLongArrowAltRight } from "react-icons/fa";
import srcIcon from "@/../public/network_logo.svg";
import abi from "./contants";
import { ToastContainer, toast } from "react-toastify";

const inter = Inter({ subsets: ["latin"] });
const client = createThirdwebClient({
  clientId: "f96f88ac0612eb79d45ade40417f369c",
});
const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  walletConnect(),
  createWallet("com.trustwallet.app"),
  createWallet("me.rainbow"),
  createWallet("app.phantom"),
];

export default function Home() {
  const account: any = useActiveAccount();
  const [blance, setBlance] = useState<number>(0n as unknown as number);
  const contract = getContract<any>({
    client,
    chain: sepolia,
    address: "0x700977596275D1E911854316a9ee388de46BEa82",

    abi: abi,
  });
  useEffect(() => {
    const fetch = async () => {
      if (account) {
        const balance = await readContract({
          contract: contract,
          method: "function balanceOf(address) view returns (uint256)",
          params: [account.address],
        });
        setBlance(balance);
      }
    };
    fetch();
  }, [account, contract]);

  const handleSendMoney = async () => {
    if (blance == 0) {
      toast.success("Account not enough money to send");
      return;
    }

    const transaction = prepareContractCall<any, any, any>({
      contract,
      method: "transfer",
      params: ["0x2bA98dFD80e5E15c55A90Fd7a833F10C2E6aeD89", toWei("10")],
    });

    const receipt = await sendAndConfirmTransaction({
      transaction,
      account: account,
    });
    if (receipt.status === "success") {
      toast.success("Send successlly");
    }
    // const result = await waitForReceipt(receipt);
  };
  return (
    <main
      className={`grid sm:grid-cols-1 lg:grid-cols-2 min-h-screen items-center ${inter.className}`}
    >
      <div className="px-[25px] py-[50px] md:px-[100px] md:py-[160px] h-[50vh] md:h-[100vh] bg-white shadow -ml-1 flex justify-center">
        <div className="w-full h-[280px] p-4 md:p-8 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <div className="w-full flex justify-between mb-[20px]">
            <Image width={80} height={40} src={srcIcon} alt="Eclo Logo" />
            <IoIosMore className="cursor-pointer" />
          </div>
          <div className="flex mb-[20px]">
            <span className="text-gray-500 w-[100px]">Balance:</span>
            <span className="font-semibold text-wrap">{blance + " USDT"}</span>
          </div>
          <div className="flex mb-[20px]">
            <span className="text-gray-500 w-[100px]">Thanh toán</span>
            <span className="font-semibold">xxxx912321</span>
          </div>
          <div className="flex mb-[20px]">
            <span className="text-gray-500 w-[100px]">Số tiền</span>
            <div className="flex space-x-3">
              <span className="font-semibold">1.2 USDT</span>
              <FaLongArrowAltRight className="mt-1" />
              <span className="font-semibold">120 KIMOCHI</span>
            </div>
          </div>
          <button
            onClick={handleSendMoney}
            className="w-full inline-flex items-center px-3 py-2 text-sm text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 font-bold justify-center"
          >
            Chuyển tiền
            <svg
              className="rtl:rotate-180 w-3.5 h-3.5 ms-2"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </button>
        </div>
        
      </div>
      <div className="bg-gray-50 h-[100vh] relative">
        <div className="flex flex-col px-[25px] py-[50px] md:px-[100px] md:py-[120px]">
          <div>
            <Image width={100} height={50} src={srcIcon} alt="Eclo Logo" />
            <p className="text-sm mt-5">
              Adventuner Membership (Yearly) at YummyMath
            </p>
            <p className="text-4xl uppercase py-1 font-semibold">25,00 US$</p>
            <p className="text-sm py-1">
              Access to activites in editable format (Word, Excel, etc.) to
              customzie. Solution and supporting materials for all activities.
              Access to all materials published before January 1st, 2024.
            </p>
          </div>
          <div className="mt-40 flex">
            <span className="border-r-2 px-2 text-xs text-gray-500">
              Được cung cấp bới{" "}
              <span className="uppercase text-black">Eclo</span>
            </span>
            <span className="border-r-2 px-2 text-xs text-gray-500">
              Điều khoản
            </span>
            <span className="px-2 text-xs text-gray-500">Quyền riêng tư</span>
          </div>
        </div>
        <div className="fixed top-0 right-0">
          <ConnectButton
            wallets={wallets}
            theme={"light"}
            client={client}
            connectModal={{
              size: "compact",
              titleIcon: "",
              welcomeScreen: { title: "r" },
            }}
          />
        </div>
      </div>
      <ToastContainer />
    </main>
  );
}
