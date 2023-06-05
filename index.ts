import { execute } from './.graphclient';
import gql from 'graphql-tag';

const TOKEN_ADDRESS = '0x43C3EBaFdF32909aC60E80ee34aE46637E743d65';

async function fetchDataHourly(query: any) {
  const now = Math.floor(Date.now() / 1000);
  const oneHour = 60 * 60;
  const startDate = now - 30 * 24 * oneHour;
  const endDate = now;

  const numHours = Math.floor((endDate - startDate) / oneHour);

  for (let i = 0; i < numHours; i++) {
    const currentTimestamp = startDate + i * oneHour;

    const response = await execute(query, {
      tokenAddress: TOKEN_ADDRESS,
      date_gt: currentTimestamp,
    });

    const data = response.data.surgeswapDayDatas;
    console.log('Data for', new Date(currentTimestamp * 1000), ':', data);
  }
}

async function retrievePriceHistory() {
  const priceHistoryQuery = gql`
    query PriceHistory($tokenAddress: ID!) {
      surgeswapDayDatas(
        where: {
          token: $tokenAddress
          date_gt: 0
        }
        orderBy: date
        orderDirection: asc
      ) {
        date
        priceUSD
      }
    }
  `;

  await fetchDataHourly(priceHistoryQuery);
}

async function retrieveVolumeHistory() {
  const volumeHistoryQuery = gql`
    query VolumeHistory($tokenAddress: ID!) {
      surgeswapDayDatas(
        where: {
          token: $tokenAddress
          date_gt: 0
        }
        orderBy: date
        orderDirection: asc
      ) {
        date
        totalVolumeUSD
      }
    }
  `;

  await fetchDataHourly(volumeHistoryQuery);
}

async function retrieveLiquidityHistory() {
  const liquidityHistoryQuery = gql`
    query LiquidityHistory($tokenAddress: ID!) {
      surgeswapDayDatas(
        where: {
          token: $tokenAddress
          date_gt: 0
        }
        orderBy: date
        orderDirection: asc
      ) {
        date
        totalLiquidityUSD
      }
    }
  `;

  await fetchDataHourly(liquidityHistoryQuery);
}

async function runScript() {
  try {
    await retrievePriceHistory();
    await retrieveVolumeHistory();
    await retrieveLiquidityHistory();
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

runScript();
