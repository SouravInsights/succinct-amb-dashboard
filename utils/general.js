import { ethers } from "ethers";
import SuccinctABI from "../lib/abis/SuccinctABI.json";

export const gnosisProvider = new ethers.providers.JsonRpcProvider("https://rpc.gnosischain.com");

export const SuccinctGnosisContract = new ethers.Contract(
  '0x11f4B338c6127F0939d3D7CD56b1C9e6c4a68725',
  SuccinctABI,
  gnosisProvider
);

export const gasSpent = (receipt) => {
 return ethers.utils.formatEther(receipt.gasUsed.mul(receipt.effectiveGasPrice));
}

export const truncateAddress = (addy) =>
  `${addy?.slice(0, 6)}...${addr.slice(-4)}`;

export const truncateTxHash = (hash) =>
  `${hash?.slice(0, 18)}...`;