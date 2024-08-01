"use client";

import {
  createThirdwebClient,
  getContract,
  prepareContractCall,
  sendAndConfirmTransaction,
} from "thirdweb";
import { useActiveAccount } from "thirdweb/react";
import { createWallet, walletConnect } from "thirdweb/wallets";
import { readContract } from "thirdweb";
import { useEffect, useState } from "react";
import { sepolia } from "thirdweb/chains";
import srcIcon from "@/../public/network_logo.png";
import { coreAbi, coreContract } from "../context/contants";
import { toast } from "react-hot-toast";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import { defineChain } from "thirdweb";
import { ethers } from "ethers";
import Footer from "@/sections/footer";
import Header from "@/sections/header";
import TimeStart from "@/sections/timeStart";
import TimeNextCycle from "@/sections/timeNextCycle";


const client = createThirdwebClient({
  clientId: "f96f88ac0612eb79d45ade40417f369c",
});

const wallets = [
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  walletConnect(),
  createWallet("com.trustwallet.app"),
  createWallet("app.phantom"),
  createWallet("com.binance"),
];

const otona = defineChain({
  id: 81247166294,
  name: "Otona testnet",
  blockExplorers: [{ name: "OtoScan", url: "https://testnet.otoscan.io" }],
  nativeCurrency: { name: "Otona", symbol: "OTO", decimals: 18 },
  rpc: "https://rpc.testnet.otochain.io",
  testnet: true,
});

interface InfoType {
  amount: number;
  account: string;
  lastClaimedPeriod: number;
  revoked: boolean;
  startTime: string;
  timeRevoked: number;
}

export default function Home() {
  const account: any = useActiveAccount();
  const [currentPeriod, setCurrentPeriod] = useState<number | null>(null);
  const [totalBeneficiary, setTotalBeneficiary] = useState<number>(0);
  const [balance, setBalance] = useState<number>(0);
  const [info, setInfo] = useState<InfoType | null>(null);
  const [arrCycle, setArrCycle] = useState<any>([]);
  const [timeStart, setTimeStart] = useState<string>("");
  const [timeCycleNext, setTimeCycleNext] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  
  const contract = getContract<any>({
    client,
    chain: sepolia,
    address: coreContract,
    abi: coreAbi,
  });

  // 
  useEffect(() => {
    const accountInfo = async () => {
      if (account) {
        try {
          const infoAc = await readContract({
            contract,
            method: "getBeneficiary",
            params: [account.address],
          });
          setInfo(infoAc);
        } catch (error) {
          setInfo(null);
          Swal.fire({
            icon: "error",
            title: "Warning",
            text: "You are not the beneficiary!",
          });
        }
      }
    };
    accountInfo();
  }, [account]);

  useEffect(() => {
    const getCurrentPeriod = async () => {
      try {
        const getCurrent = await readContract({
          contract,
          method: "getCurrentPeriod",
        });
        setCurrentPeriod(Number(getCurrent));
        const balanceTotal = await readContract({
          contract,
          method: "totalCurrent",
        });
        setBalance(Number(ethers.formatEther(balanceTotal.toString())));
        const totalBeneficiary = await readContract({
          contract,
          method: "beneficiariesPerPeriod",
          params: [getCurrent],
        });
        setTotalBeneficiary(totalBeneficiary);
        const time = await readContract({ contract, method: "start" });
        const date = dayjs(Number(time) * 1000);

        // Định dạng ngày tháng năm, giờ phút giây
        const formattedDate = date.format("YYYY-MM-DD HH:mm:ss");
        setTimeStart(formattedDate);

        // Tạo mảng lưu trữ các chu kỳ thời gian
        const timeCycles = [];

        // Thêm chu kỳ đầu tiên (cộng 1 giờ)
        timeCycles.push({
          cycle: 1,
          timestart: date.add(1, "hour").unix(), // Unix timestamp (in seconds)
        });

        // Thêm 19 chu kỳ còn lại (mỗi chu kỳ cộng thêm 30 phút so với chu kỳ trước)
        for (let i = 1; i < 20; i++) {
          timeCycles.push({
            cycle: i + 1,
            timestart: timeCycles[i - 1].timestart + 30 * 60, // Cộng thêm 30 phút (1800 giây)
          });
        }

        var filteredTimeCycles = timeCycles.filter(
          (cycle) => cycle.timestart > dayjs().subtract(1, "hour").unix()
        );
        if (filteredTimeCycles.length === 0) {
          filteredTimeCycles = timeCycles.slice(15, 20);
        }

        var filteredTimeCyclesNext = timeCycles.filter(
          (cycle) => cycle.timestart > dayjs().unix()
        );
        if (filteredTimeCyclesNext.length > 0) {
          setTimeCycleNext(filteredTimeCyclesNext[0].timestart);
        }

        const firstFiveFilteredCycles = filteredTimeCycles.slice(0, 5);

        // Chuyển đổi Unix timestamp sang định dạng "YYYY-MM-DD HH:mm:ss"
        const formattedTimeCycles = firstFiveFilteredCycles.map((cycle) => ({
          stepNumber: cycle.cycle,
          time: dayjs(cycle.timestart * 1000).format("YYYY-MM-DD HH:mm:ss"),
        }));

        // Đặt mảng chu kỳ đã định dạng vào setArrCycle
        setArrCycle(formattedTimeCycles);
      } catch (error) {
        console.log(error);
      }
    };
    getCurrentPeriod();
  }, []);

  useEffect(() => {
    if (timeCycleNext === 0) return; // Không làm gì nếu timeCycleNext chưa được thiết lập

    const updateCountdown = () => {
      const now = dayjs();
      const end = dayjs(timeCycleNext * 1000);
      const diff = end.diff(now, "second");
      setTimeLeft(diff);
    };

    updateCountdown(); // Cập nhật ngay lập tức khi component được mount

    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [timeCycleNext]);

  const Claim = async () => {
    if (!account) {
      toast.error("Please connect your wallet.", { duration: 1000 });
      return;
    }

    try {
      const transaction = prepareContractCall({ contract, method: "claim" });
      toast.loading("Transaction is pending...");
      const receipt = await sendAndConfirmTransaction({ account, transaction });
      toast.dismiss();
      console.log(receipt);
      if (receipt.status !== "success") {
        toast.error("Error sending transaction", { duration: 1000 });
      }
      toast.success("Transaction successful 👌", { duration: 1000 });
      window.location.reload();
    } catch (error) {
      toast.dismiss();
      toast.error((error as Error).message.split("\n")[0], { duration: 2000 });
    }
  };

  return (
    <main className={`grid h-[100vh] min-h-screen`}>
      <div className=" ${inter.className}">
        <div className="bg-white h-[100vh] min-h-screen flex order-1 md:-order-1 items-center justify-center ">
          <div className="w-[90%] lg:w-[35%] md:w-[50%] xl:w-[30%]">
            <div>
              <Header img={srcIcon} wallets={wallets} sepolia={sepolia} client={client} />
              <div>
                <div className="main-container">
                  <TimeStart timeStart={timeStart}/>
                  <TimeNextCycle timeLeft={timeLeft}/>
                  <div className="steps-container">
                    {info?.revoked
                      ? arrCycle.map(
                          ({
                            stepNumber,
                            time,
                          }: {
                            stepNumber: number;
                            time: string;
                          }) => (
                            <>
                              <div className="line completed"></div>
                              <div
                                key={stepNumber}
                                className={`step relative group ${
                                  stepNumber <= Number(info?.lastClaimedPeriod)
                                    ? "completed"
                                    : ""
                                } ${
                                  currentPeriod === stepNumber
                                    ? "in-current"
                                    : ""
                                } ${
                                  stepNumber > Number(info?.timeRevoked)
                                    ? "error"
                                    : ""
                                }`}
                              >
                                {currentPeriod === stepNumber && (
                                  <div className="preloader"></div>
                                )}
                                <div
                                  className={`label ${
                                    currentPeriod === stepNumber
                                      ? "loading"
                                      : ""
                                  }`}
                                >
                                  {stepNumber}
                                </div>
                                {stepNumber > Number(info?.timeRevoked) &&
                                  stepNumber != currentPeriod && (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        d="M6 6l12 12M18 6l-12 12"
                                        stroke="black"
                                        stroke-width="2"
                                      />
                                    </svg>
                                  )}
                                {stepNumber <=
                                  Number(info?.lastClaimedPeriod) &&
                                  stepNumber != currentPeriod && (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                                    </svg>
                                  )}
                                {/* Tooltip */}
                                <div className="absolute w-[150px] left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-sm py-1 px-2 rounded">
                                  {time}
                                </div>
                              </div>
                            </>
                          )
                        )
                      : arrCycle.map(
                          ({
                            stepNumber,
                            time,
                          }: {
                            stepNumber: number;
                            time: string;
                          }) => (
                            <>
                              <div className="line completed"></div>
                              <div
                                key={stepNumber}
                                className={`step relative group ${
                                  currentPeriod === stepNumber &&
                                  currentPeriod ===
                                    Number(info?.lastClaimedPeriod)
                                    ? "in-progress"
                                    : ""
                                } ${
                                  currentPeriod === stepNumber &&
                                  currentPeriod !==
                                    Number(info?.lastClaimedPeriod)
                                    ? "in-current"
                                    : ""
                                } ${
                                  stepNumber <= Number(info?.lastClaimedPeriod)
                                    ? "completed"
                                    : ""
                                }`}
                              >
                                {currentPeriod === stepNumber && (
                                  <div className="preloader"></div>
                                )}
                                <div
                                  className={`label ${
                                    currentPeriod === stepNumber
                                      ? "loading"
                                      : ""
                                  }`}
                                >
                                  {stepNumber}
                                </div>
                                {stepNumber <=
                                  Number(info?.lastClaimedPeriod) &&
                                  stepNumber != currentPeriod && (
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="24"
                                      height="24"
                                      viewBox="0 0 24 24"
                                    >
                                      <path d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z" />
                                    </svg>
                                  )}
                                <div
                                  className={`icon ${
                                    stepNumber <=
                                    Number(info?.lastClaimedPeriod)
                                      ? "completed"
                                      : ""
                                  }`}
                                ></div>
                                {/* Tooltip */}
                                <div className="absolute w-[150px] left-1/2 transform -translate-x-1/2 bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-sm py-1 px-2 rounded">
                                  {time}
                                </div>
                              </div>
                            </>
                          )
                        )}
                  </div>
                </div>
              </div>
              <div className=" p-4 md:p-8 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 ">
                <div className="flex mb-[20px] ">
                  <span className="text-gray-500 w-[150px]">Total:</span>
                  <span className="font-semibold text-wrap">
                    {balance + " OTO"}
                  </span>
                </div>
                <div className="flex mb-[20px]">
                  <span className="text-gray-500 w-[150px]">Received: </span>
                  <span className="font-semibold text-wrap">
                    {Number(
                      ethers.formatEther(info?.amount || 0)
                    ).toLocaleString()}{" "}
                    OTO{" "}
                  </span>
                </div>
                <div className="flex mb-[20px]">
                  <span className="text-gray-500 w-[150px]">
                    Beneficiaries:{" "}
                  </span>
                  <span className="font-semibold text-wrap">
                    {Number(totalBeneficiary)} Member
                  </span>
                </div>
                <button
                  onClick={Claim}
                  className="w-full inline-flex items-center px-3 py-2 text-sm text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 font-bold justify-center"
                >
                  <p className="text-xl">Claim</p>
                </button>
              </div>
              <Footer/>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
