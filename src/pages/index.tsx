import { Inter } from "next/font/google";
import Image from "next/image";
import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendAndConfirmTransaction,
  toWei,
} from "thirdweb";
import { ConnectButton, lightTheme, useActiveAccount } from "thirdweb/react";
import { IoIosMore } from "react-icons/io";
import { createWallet, walletConnect } from "thirdweb/wallets";
import { readContract } from "thirdweb";
import { useEffect, useState } from "react";
import { sepolia } from "thirdweb/chains";
import { FaLongArrowAltRight } from "react-icons/fa";
import srcIcon from "@/../public/network_logo.svg";
import abi from "./contants";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { createWalletConnectClient } from "thirdweb/wallets/wallet-connect";

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
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const contract = getContract<any>({
    client,
    chain: sepolia,
    address: "0x700977596275D1E911854316a9ee388de46BEa82",
    abi: abi,
  });

  useEffect(() => {
    const fetch = async () => {
      if (account) {
        const balanceBigInt = await readContract({
          contract: contract,
          method: "function balanceOf(address) view returns (uint256)",
          params: [account.address],
        });
        setBalance(Number(balanceBigInt));
      }
    };
    fetch();
  }, [account, contract]);

  const handleSendMoney = async () => {
    if (!account) {
      toast.error("Please connect wallet");
      return;
    }
    if (balance === 0) {
      toast.error("Account not enough money to send");
      return;
    }
    setIsLoading(true);
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
      toast.success("Send successfully");
    }
    setIsLoading(false);
  };
  return (
    <main
      className={`grid grid-cols-1 md:grid-cols-2 min-h-screen items-center ${inter.className}`}
    >
      <div className="bg-gray-50 h-[100vh] relative order-2 md:-order-2">
        <div className="flex flex-col px-[25px] py-[50px] md:px-[100px] md:py-[180px]">
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
        <div className="fixed top-2 right-2">
          <ConnectButton
            wallets={wallets}
            theme={lightTheme({
              colors: { primaryButtonBg: "#2A4DD0" },
            })}
            client={client}
            connectModal={{
              size: "compact",
              titleIcon: "",
              welcomeScreen: { title: "r" },
            }}
          />
        </div>
      </div>
      <div className="px-[25px] py-[180px] md:px-[100px] md:py-[180px] h-[800px] md:h-[100vh] bg-white shadow -ml-1 flex justify-center order-1 md:-order-1">
        <div className="h-[280px] p-4 md:p-8 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
          <div className="w-full flex justify-between mb-[20px]">
            <Image width={80} height={40} src={srcIcon} alt="Eclo Logo" />
            <IoIosMore className="cursor-pointer" />
          </div>
          <div className="flex mb-[20px]">
            <span className="text-gray-500 w-[100px]">Balance:</span>
            <span className="font-semibold text-wrap">{balance + " USDT"}</span>
          </div>
          <div className="flex mb-[20px]">
            <span className="text-gray-500 w-[100px]">Thanh toán </span>
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
            disabled={isLoading}
          >
            {isLoading ? (
              <div role="status">
                <svg
                  aria-hidden="true"
                  className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
              </div>
            ) : (
              <>
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
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
      <ToastContainer />
    </main>
  );
}
