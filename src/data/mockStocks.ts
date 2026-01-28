import { StockData, WeightConfig } from '@/types/stock';
import { scoreStock } from '@/lib/stockScoring';

// Expanded IDX stock data with realistic values (30+ stocks)
const rawStockData = [
  // Blue Chips - Financials
  { ticker: 'BBCA.JK', name: 'Bank Central Asia Tbk', sector: 'Financials', price: 9825, change: 125, changePercent: 1.29, volume: 12500000, marketCap: 1210000000000000, der: 0.85, roe: 18.5, pbv: 4.2, pe: 24.5, eps: 401, beta: 0.95, volatility: 1.2, avgVolume: 15000000, historicalPrices: [9500, 9550, 9600, 9650, 9700, 9750, 9780, 9800, 9825, 9810, 9800, 9780, 9790, 9800, 9825, 9850, 9875, 9900, 9850, 9825] },
  { ticker: 'BBRI.JK', name: 'Bank Rakyat Indonesia Tbk', sector: 'Financials', price: 5475, change: -25, changePercent: -0.45, volume: 45000000, marketCap: 825000000000000, der: 0.92, roe: 16.8, pbv: 2.1, pe: 12.5, eps: 438, beta: 1.05, volatility: 1.8, avgVolume: 50000000, historicalPrices: [5200, 5250, 5300, 5350, 5400, 5450, 5475, 5500, 5475, 5450, 5425, 5400, 5420, 5450, 5475, 5500, 5525, 5500, 5480, 5475] },
  { ticker: 'BMRI.JK', name: 'Bank Mandiri Tbk', sector: 'Financials', price: 6425, change: -50, changePercent: -0.77, volume: 32000000, marketCap: 598000000000000, der: 0.88, roe: 15.9, pbv: 1.9, pe: 11.8, eps: 545, beta: 1.08, volatility: 1.6, avgVolume: 35000000, historicalPrices: [6200, 6250, 6300, 6350, 6400, 6425, 6450, 6475, 6450, 6425, 6400, 6375, 6380, 6400, 6425, 6450, 6475, 6500, 6450, 6425] },
  { ticker: 'BBNI.JK', name: 'Bank Negara Indonesia Tbk', sector: 'Financials', price: 5150, change: 75, changePercent: 1.48, volume: 22000000, marketCap: 96000000000000, der: 0.95, roe: 14.2, pbv: 1.3, pe: 9.2, eps: 560, beta: 1.15, volatility: 1.9, avgVolume: 25000000, historicalPrices: [4900, 4950, 5000, 5025, 5050, 5075, 5100, 5125, 5140, 5150, 5145, 5130, 5120, 5130, 5140, 5150, 5160, 5155, 5150, 5150] },
  { ticker: 'BRIS.JK', name: 'Bank Syariah Indonesia Tbk', sector: 'Financials', price: 2680, change: 40, changePercent: 1.52, volume: 18000000, marketCap: 135000000000000, der: 0.75, roe: 12.5, pbv: 2.4, pe: 19.2, eps: 140, beta: 0.92, volatility: 2.1, avgVolume: 20000000, historicalPrices: [2550, 2580, 2600, 2620, 2640, 2660, 2670, 2680, 2690, 2685, 2680, 2675, 2680, 2685, 2690, 2695, 2690, 2685, 2680, 2680] },
  
  // Telecom
  { ticker: 'TLKM.JK', name: 'Telkom Indonesia Tbk', sector: 'Telecommunications', price: 3860, change: 40, changePercent: 1.05, volume: 25000000, marketCap: 382000000000000, der: 0.65, roe: 21.2, pbv: 2.8, pe: 13.2, eps: 292, beta: 0.75, volatility: 0.9, avgVolume: 30000000, historicalPrices: [3700, 3720, 3750, 3780, 3800, 3820, 3840, 3850, 3860, 3870, 3880, 3860, 3850, 3840, 3850, 3860, 3870, 3880, 3865, 3860] },
  { ticker: 'EXCL.JK', name: 'XL Axiata Tbk', sector: 'Telecommunications', price: 2340, change: -20, changePercent: -0.85, volume: 8500000, marketCap: 31500000000000, der: 1.45, roe: 5.8, pbv: 1.1, pe: 19.5, eps: 120, beta: 0.88, volatility: 1.5, avgVolume: 9000000, historicalPrices: [2400, 2380, 2360, 2350, 2340, 2330, 2340, 2350, 2345, 2340, 2335, 2340, 2345, 2350, 2345, 2340, 2335, 2340, 2340, 2340] },
  { ticker: 'ISAT.JK', name: 'Indosat Ooredoo Hutchison', sector: 'Telecommunications', price: 8925, change: 125, changePercent: 1.42, volume: 4200000, marketCap: 48000000000000, der: 1.25, roe: 8.5, pbv: 1.4, pe: 16.5, eps: 541, beta: 0.95, volatility: 1.8, avgVolume: 5000000, historicalPrices: [8600, 8650, 8700, 8750, 8800, 8850, 8875, 8900, 8925, 8950, 8940, 8930, 8920, 8925, 8940, 8950, 8940, 8930, 8925, 8925] },
  
  // Consumer Discretionary
  { ticker: 'ASII.JK', name: 'Astra International Tbk', sector: 'Consumer Discretionary', price: 5325, change: 75, changePercent: 1.43, volume: 18000000, marketCap: 215000000000000, der: 0.78, roe: 14.5, pbv: 1.4, pe: 9.8, eps: 543, beta: 1.12, volatility: 1.5, avgVolume: 20000000, historicalPrices: [5100, 5150, 5200, 5225, 5250, 5275, 5300, 5310, 5320, 5325, 5330, 5320, 5310, 5300, 5310, 5325, 5350, 5375, 5340, 5325] },
  { ticker: 'ACES.JK', name: 'Ace Hardware Indonesia Tbk', sector: 'Consumer Discretionary', price: 735, change: 10, changePercent: 1.38, volume: 12000000, marketCap: 12500000000000, der: 0.15, roe: 18.5, pbv: 3.2, pe: 17.3, eps: 42, beta: 0.72, volatility: 1.2, avgVolume: 14000000, historicalPrices: [700, 710, 715, 720, 725, 730, 732, 735, 738, 740, 738, 735, 732, 735, 738, 740, 738, 736, 735, 735] },
  { ticker: 'MAPI.JK', name: 'Mitra Adiperkasa Tbk', sector: 'Consumer Discretionary', price: 1680, change: 25, changePercent: 1.51, volume: 5500000, marketCap: 28000000000000, der: 0.95, roe: 12.8, pbv: 2.8, pe: 21.8, eps: 77, beta: 1.05, volatility: 1.8, avgVolume: 6000000, historicalPrices: [1600, 1620, 1640, 1650, 1660, 1670, 1675, 1680, 1685, 1690, 1688, 1685, 1682, 1680, 1682, 1685, 1688, 1685, 1682, 1680] },
  
  // Consumer Staples
  { ticker: 'UNVR.JK', name: 'Unilever Indonesia Tbk', sector: 'Consumer Staples', price: 3420, change: -30, changePercent: -0.87, volume: 8500000, marketCap: 130000000000000, der: 2.15, roe: 85.5, pbv: 28.5, pe: 33.2, eps: 103, beta: 0.55, volatility: 0.8, avgVolume: 10000000, historicalPrices: [3500, 3480, 3460, 3450, 3440, 3430, 3420, 3425, 3430, 3420, 3410, 3400, 3410, 3420, 3430, 3440, 3435, 3425, 3420, 3420] },
  { ticker: 'ICBP.JK', name: 'Indofood CBP Sukses Makmur', sector: 'Consumer Staples', price: 11225, change: 175, changePercent: 1.58, volume: 5200000, marketCap: 131000000000000, der: 0.42, roe: 17.8, pbv: 4.5, pe: 25.3, eps: 444, beta: 0.68, volatility: 1.1, avgVolume: 6000000, historicalPrices: [10800, 10850, 10900, 10950, 11000, 11050, 11100, 11150, 11175, 11200, 11225, 11200, 11175, 11150, 11175, 11200, 11225, 11250, 11230, 11225] },
  { ticker: 'INDF.JK', name: 'Indofood Sukses Makmur Tbk', sector: 'Consumer Staples', price: 6675, change: 25, changePercent: 0.38, volume: 7800000, marketCap: 58500000000000, der: 0.95, roe: 11.2, pbv: 1.1, pe: 9.8, eps: 681, beta: 0.82, volatility: 1.3, avgVolume: 8500000, historicalPrices: [6500, 6520, 6550, 6580, 6600, 6625, 6650, 6675, 6700, 6680, 6660, 6640, 6650, 6660, 6675, 6690, 6700, 6685, 6675, 6675] },
  { ticker: 'MYOR.JK', name: 'Mayora Indah Tbk', sector: 'Consumer Staples', price: 2430, change: 40, changePercent: 1.67, volume: 9200000, marketCap: 54200000000000, der: 0.72, roe: 19.8, pbv: 3.8, pe: 19.2, eps: 127, beta: 0.88, volatility: 1.4, avgVolume: 10000000, historicalPrices: [2300, 2320, 2350, 2370, 2390, 2400, 2410, 2420, 2425, 2430, 2435, 2430, 2425, 2420, 2425, 2430, 2435, 2432, 2430, 2430] },
  { ticker: 'AMRT.JK', name: 'Sumber Alfaria Trijaya Tbk', sector: 'Consumer Staples', price: 2850, change: 50, changePercent: 1.79, volume: 15000000, marketCap: 115000000000000, der: 0.85, roe: 22.5, pbv: 5.2, pe: 23.1, eps: 123, beta: 0.78, volatility: 1.0, avgVolume: 16000000, historicalPrices: [2750, 2770, 2790, 2800, 2810, 2820, 2830, 2840, 2845, 2850, 2855, 2850, 2845, 2840, 2845, 2850, 2855, 2852, 2850, 2850] },
  
  // Technology
  { ticker: 'GOTO.JK', name: 'GoTo Gojek Tokopedia Tbk', sector: 'Technology', price: 76, change: 4, changePercent: 5.56, volume: 850000000, marketCap: 89000000000000, der: 0.25, roe: -15.2, pbv: 0.65, pe: -5.2, eps: -14.6, beta: 1.85, volatility: 4.5, avgVolume: 700000000, historicalPrices: [68, 70, 72, 74, 73, 72, 74, 76, 78, 80, 78, 76, 74, 72, 74, 76, 78, 80, 77, 76] },
  { ticker: 'BUKA.JK', name: 'Bukalapak.com Tbk', sector: 'Technology', price: 136, change: 6, changePercent: 4.62, volume: 320000000, marketCap: 14000000000000, der: 0.15, roe: -8.5, pbv: 0.85, pe: -10.1, eps: -13.5, beta: 1.92, volatility: 5.2, avgVolume: 280000000, historicalPrices: [125, 128, 130, 132, 134, 135, 136, 138, 140, 142, 140, 138, 136, 134, 136, 138, 140, 138, 137, 136] },
  { ticker: 'EMTK.JK', name: 'Elang Mahkota Teknologi', sector: 'Technology', price: 480, change: 12, changePercent: 2.56, volume: 25000000, marketCap: 26500000000000, der: 0.35, roe: 6.2, pbv: 0.72, pe: 11.6, eps: 41, beta: 1.25, volatility: 2.8, avgVolume: 22000000, historicalPrices: [450, 455, 460, 465, 468, 472, 475, 478, 480, 482, 480, 478, 476, 478, 480, 482, 480, 479, 480, 480] },
  
  // Materials & Mining
  { ticker: 'ANTM.JK', name: 'Aneka Tambang Tbk', sector: 'Materials', price: 1825, change: 45, changePercent: 2.53, volume: 65000000, marketCap: 43800000000000, der: 0.35, roe: 12.8, pbv: 1.2, pe: 9.5, eps: 192, beta: 1.45, volatility: 3.2, avgVolume: 55000000, historicalPrices: [1700, 1720, 1750, 1780, 1800, 1820, 1840, 1860, 1880, 1850, 1820, 1800, 1820, 1840, 1860, 1880, 1850, 1830, 1825, 1825] },
  { ticker: 'INCO.JK', name: 'Vale Indonesia Tbk', sector: 'Materials', price: 4280, change: -60, changePercent: -1.38, volume: 12000000, marketCap: 42500000000000, der: 0.08, roe: 8.5, pbv: 1.5, pe: 17.5, eps: 245, beta: 1.35, volatility: 2.5, avgVolume: 14000000, historicalPrices: [4400, 4380, 4360, 4340, 4320, 4300, 4290, 4280, 4275, 4280, 4290, 4285, 4280, 4275, 4280, 4285, 4280, 4278, 4280, 4280] },
  { ticker: 'MDKA.JK', name: 'Merdeka Copper Gold Tbk', sector: 'Materials', price: 2650, change: 80, changePercent: 3.11, volume: 28000000, marketCap: 62800000000000, der: 0.85, roe: 8.5, pbv: 2.2, pe: 26.5, eps: 100, beta: 1.62, volatility: 3.5, avgVolume: 25000000, historicalPrices: [2450, 2480, 2510, 2540, 2570, 2600, 2620, 2640, 2650, 2660, 2650, 2640, 2630, 2640, 2650, 2660, 2670, 2655, 2650, 2650] },
  { ticker: 'TINS.JK', name: 'Timah Tbk', sector: 'Materials', price: 1125, change: 25, changePercent: 2.27, volume: 35000000, marketCap: 8700000000000, der: 0.65, roe: 5.2, pbv: 0.9, pe: 17.3, eps: 65, beta: 1.48, volatility: 3.8, avgVolume: 32000000, historicalPrices: [1050, 1060, 1075, 1085, 1095, 1100, 1110, 1115, 1120, 1125, 1130, 1125, 1120, 1115, 1120, 1125, 1130, 1127, 1125, 1125] },
  
  // Energy
  { ticker: 'ADRO.JK', name: 'Adaro Energy Indonesia Tbk', sector: 'Energy', price: 2740, change: -60, changePercent: -2.14, volume: 42000000, marketCap: 85500000000000, der: 0.28, roe: 28.5, pbv: 1.05, pe: 3.7, eps: 740, beta: 1.55, volatility: 2.8, avgVolume: 38000000, historicalPrices: [2900, 2880, 2860, 2840, 2820, 2800, 2780, 2760, 2750, 2740, 2730, 2720, 2730, 2740, 2750, 2760, 2750, 2745, 2740, 2740] },
  { ticker: 'PTBA.JK', name: 'Bukit Asam Tbk', sector: 'Energy', price: 3050, change: 30, changePercent: 0.99, volume: 12500000, marketCap: 35000000000000, der: 0.32, roe: 32.5, pbv: 1.8, pe: 5.5, eps: 555, beta: 1.38, volatility: 2.5, avgVolume: 14000000, historicalPrices: [2900, 2920, 2950, 2980, 3000, 3020, 3040, 3050, 3060, 3070, 3060, 3050, 3040, 3030, 3040, 3050, 3060, 3055, 3050, 3050] },
  { ticker: 'ITMG.JK', name: 'Indo Tambangraya Megah Tbk', sector: 'Energy', price: 26750, change: -500, changePercent: -1.84, volume: 2800000, marketCap: 30200000000000, der: 0.22, roe: 45.5, pbv: 2.1, pe: 4.6, eps: 5815, beta: 1.42, volatility: 2.9, avgVolume: 3000000, historicalPrices: [27500, 27400, 27300, 27200, 27100, 27000, 26900, 26850, 26800, 26750, 26700, 26750, 26800, 26750, 26700, 26750, 26800, 26775, 26750, 26750] },
  { ticker: 'MEDC.JK', name: 'Medco Energi Internasional', sector: 'Energy', price: 1385, change: 15, changePercent: 1.09, volume: 18000000, marketCap: 35000000000000, der: 1.85, roe: 18.5, pbv: 1.4, pe: 7.5, eps: 185, beta: 1.28, volatility: 2.2, avgVolume: 20000000, historicalPrices: [1350, 1360, 1365, 1370, 1375, 1380, 1382, 1385, 1388, 1390, 1388, 1385, 1382, 1385, 1388, 1390, 1388, 1386, 1385, 1385] },
  
  // Healthcare
  { ticker: 'KLBF.JK', name: 'Kalbe Farma Tbk', sector: 'Healthcare', price: 1595, change: 15, changePercent: 0.95, volume: 18500000, marketCap: 74700000000000, der: 0.18, roe: 15.2, pbv: 2.9, pe: 19.2, eps: 83, beta: 0.72, volatility: 1.0, avgVolume: 20000000, historicalPrices: [1550, 1560, 1570, 1575, 1580, 1585, 1590, 1595, 1600, 1595, 1590, 1585, 1590, 1595, 1600, 1605, 1600, 1598, 1595, 1595] },
  { ticker: 'SIDO.JK', name: 'Industri Jamu Dan Farmasi', sector: 'Healthcare', price: 715, change: 10, changePercent: 1.42, volume: 22000000, marketCap: 21500000000000, der: 0.08, roe: 25.5, pbv: 5.8, pe: 22.7, eps: 31, beta: 0.65, volatility: 0.9, avgVolume: 25000000, historicalPrices: [690, 695, 700, 705, 708, 710, 712, 715, 718, 720, 718, 715, 712, 715, 718, 720, 718, 716, 715, 715] },
  { ticker: 'DVLA.JK', name: 'Darya-Varia Laboratoria Tbk', sector: 'Healthcare', price: 2320, change: 20, changePercent: 0.87, volume: 850000, marketCap: 2600000000000, der: 0.12, roe: 12.8, pbv: 1.8, pe: 14.1, eps: 165, beta: 0.58, volatility: 0.8, avgVolume: 900000, historicalPrices: [2280, 2285, 2290, 2295, 2300, 2305, 2310, 2315, 2318, 2320, 2322, 2320, 2318, 2315, 2318, 2320, 2322, 2321, 2320, 2320] },
  
  // Property & Real Estate
  { ticker: 'BSDE.JK', name: 'Bumi Serpong Damai Tbk', sector: 'Real Estate', price: 1045, change: 15, changePercent: 1.46, volume: 28000000, marketCap: 22500000000000, der: 0.45, roe: 6.5, pbv: 0.65, pe: 10.0, eps: 104, beta: 1.15, volatility: 1.8, avgVolume: 30000000, historicalPrices: [1000, 1010, 1020, 1025, 1030, 1035, 1040, 1042, 1045, 1048, 1050, 1048, 1045, 1042, 1045, 1048, 1050, 1047, 1045, 1045] },
  { ticker: 'SMRA.JK', name: 'Summarecon Agung Tbk', sector: 'Real Estate', price: 580, change: 10, changePercent: 1.75, volume: 35000000, marketCap: 8500000000000, der: 0.85, roe: 4.2, pbv: 0.75, pe: 17.9, eps: 32, beta: 1.22, volatility: 2.2, avgVolume: 38000000, historicalPrices: [550, 555, 560, 565, 570, 572, 575, 578, 580, 582, 584, 582, 580, 578, 580, 582, 584, 581, 580, 580] },
  { ticker: 'CTRA.JK', name: 'Ciputra Development Tbk', sector: 'Real Estate', price: 1175, change: 20, changePercent: 1.73, volume: 18000000, marketCap: 21800000000000, der: 0.55, roe: 8.5, pbv: 0.85, pe: 10.0, eps: 118, beta: 1.08, volatility: 1.6, avgVolume: 20000000, historicalPrices: [1130, 1140, 1150, 1155, 1160, 1165, 1170, 1172, 1175, 1178, 1180, 1178, 1175, 1172, 1175, 1178, 1180, 1177, 1175, 1175] },
  
  // Infrastructure
  { ticker: 'JSMR.JK', name: 'Jasa Marga Tbk', sector: 'Infrastructure', price: 4520, change: 40, changePercent: 0.89, volume: 5500000, marketCap: 32800000000000, der: 2.25, roe: 8.5, pbv: 1.2, pe: 14.1, eps: 320, beta: 0.85, volatility: 1.2, avgVolume: 6000000, historicalPrices: [4450, 4460, 4470, 4480, 4490, 4500, 4510, 4515, 4520, 4525, 4528, 4525, 4520, 4518, 4520, 4525, 4528, 4524, 4520, 4520] },
  { ticker: 'WIKA.JK', name: 'Wijaya Karya Tbk', sector: 'Infrastructure', price: 485, change: -5, changePercent: -1.02, volume: 42000000, marketCap: 4350000000000, der: 1.95, roe: 2.8, pbv: 0.45, pe: 16.2, eps: 30, beta: 1.35, volatility: 2.8, avgVolume: 45000000, historicalPrices: [500, 498, 495, 492, 490, 488, 486, 485, 484, 485, 488, 486, 485, 484, 485, 488, 486, 485, 485, 485] },
  
  // Cement & Construction Materials
  { ticker: 'SMGR.JK', name: 'Semen Indonesia Tbk', sector: 'Materials', price: 4250, change: 50, changePercent: 1.19, volume: 8500000, marketCap: 25200000000000, der: 0.42, roe: 6.8, pbv: 0.85, pe: 12.5, eps: 340, beta: 0.92, volatility: 1.4, avgVolume: 9000000, historicalPrices: [4150, 4170, 4190, 4200, 4210, 4220, 4230, 4240, 4245, 4250, 4255, 4250, 4245, 4240, 4245, 4250, 4255, 4252, 4250, 4250] },
  { ticker: 'INTP.JK', name: 'Indocement Tunggal Prakarsa', sector: 'Materials', price: 7625, change: 75, changePercent: 0.99, volume: 2200000, marketCap: 28100000000000, der: 0.18, roe: 5.5, pbv: 0.95, pe: 17.3, eps: 441, beta: 0.78, volatility: 1.1, avgVolume: 2500000, historicalPrices: [7500, 7520, 7550, 7570, 7580, 7590, 7600, 7610, 7620, 7625, 7630, 7625, 7620, 7615, 7620, 7625, 7630, 7627, 7625, 7625] },
];

const defaultBenchmarks = {
  derRange: [0, 3] as [number, number],
  roeRange: [-20, 50] as [number, number],
  pbvRange: [0, 10] as [number, number],
  peRange: [-15, 40] as [number, number],
  volatilityRange: [0, 6] as [number, number],
  betaRange: [0.5, 2] as [number, number],
  volumeRange: [1000000, 100000000] as [number, number],
};

export function getStockData(weights: WeightConfig): StockData[] {
  return rawStockData.map(stock => scoreStock(stock, weights, defaultBenchmarks));
}

export function getSectors(): string[] {
  return [...new Set(rawStockData.map(s => s.sector))];
}
