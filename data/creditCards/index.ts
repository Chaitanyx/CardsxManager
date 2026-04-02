import hdfcBankCardsJson from "./hdfc-bank.json";
import axisBankCardsJson from "./axis-bank.json";
import iciciBankCardsJson from "./icici-bank.json";
import amexBankCardsJson from "./american-express.json";
import kotakMahindraBankCardsJson from "./kotak-mahindra-bank.json";
import idfcFirstBankCardsJson from "./idfc-first-bank.json";
import rblBankCardsJson from "./rbl-bank.json";
import indusindBankCardsJson from "./indusind-bank.json";
import yesBankCardsJson from "./yes-bank.json";
import standardCharteredCardsJson from "./standard-chartered.json";
import federalBankCardsJson from "./federal-bank.json";
import auSmallFinanceBankCardsJson from "./au-small-finance-bank.json";
import canaraBankCardsJson from "./canara-bank.json";
import bankOfBarodaCardsJson from "./bank-of-baroda.json";
import sbiCardCardsJson from "./sbi-card.json";
import pnbBankCardsJson from "./pnb-bank.json";
import hsbcBankCardsJson from "./hsbc-bank.json";
import sliceBankCardsJson from "./slice-bank.json";

import type { BankCardData } from "../../types";

const hdfcBankCards = hdfcBankCardsJson as unknown as BankCardData[];
const axisBankCards = axisBankCardsJson as unknown as BankCardData[];
const iciciBankCards = iciciBankCardsJson as unknown as BankCardData[];
const amexBankCards = amexBankCardsJson as unknown as BankCardData[];
const kotakMahindraBankCards = kotakMahindraBankCardsJson as unknown as BankCardData[];
const idfcFirstBankCards = idfcFirstBankCardsJson as unknown as BankCardData[];
const rblBankCards = rblBankCardsJson as unknown as BankCardData[];
const indusindBankCards = indusindBankCardsJson as unknown as BankCardData[];
const yesBankCards = yesBankCardsJson as unknown as BankCardData[];
const standardCharteredCards = standardCharteredCardsJson as unknown as BankCardData[];
const federalBankCards = federalBankCardsJson as unknown as BankCardData[];
const auSmallFinanceBankCards = auSmallFinanceBankCardsJson as unknown as BankCardData[];
const canaraBankCards = canaraBankCardsJson as unknown as BankCardData[];
const bankOfBarodaCards = bankOfBarodaCardsJson as unknown as BankCardData[];
const sbiCardCards = sbiCardCardsJson as unknown as BankCardData[];
const pnbBankCards = pnbBankCardsJson as unknown as BankCardData[];
const hsbcBankCards = hsbcBankCardsJson as unknown as BankCardData[];
const sliceBankCards = sliceBankCardsJson as unknown as BankCardData[];

const creditCardsData: BankCardData[] = [
  ...hdfcBankCards,
  ...axisBankCards,
  ...iciciBankCards,
  ...amexBankCards,
  ...kotakMahindraBankCards,
  ...idfcFirstBankCards,
  ...rblBankCards,
  ...indusindBankCards,
  ...yesBankCards,
  ...standardCharteredCards,
  ...federalBankCards,
  ...auSmallFinanceBankCards,
  ...canaraBankCards,
  ...bankOfBarodaCards,
  ...sbiCardCards,
  ...pnbBankCards,
  ...hsbcBankCards,
  ...sliceBankCards
];

export default creditCardsData;