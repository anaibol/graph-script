import { execute } from './.graphclient';
import gql from 'graphql-tag';
import fs from 'fs';

async function retrieveMarketIndicators(tokenId: string, interval = 'daily') {
  const pageSize = 1; // Only one result needed for the initial query
  let skip = 0; // Initial skip value

  // Array to store all token day data
  let allTokenDayData: any[] = [];

  const initialResponse = await execute(gql`
    query Token($tokenId: String!) {
      token(id: $tokenId) {
        tokenDayData(
          first: 1
          skip: 0
          orderBy: date
          orderDirection: asc
        ) {
          date
        }
      }
    }
  `, {
    tokenId,
  });

  const dayZeroTimestamp = initialResponse.data.token.tokenDayData[0].date;
  const dayZer2oTimestamp = initialResponse.data.token.tokenDayData[initialResponse.data.token.tokenDayData.length - 1].date;
  console.log({dayZeroTimestamp, dayZer2oTimestamp})
  const currentTimestamp = Math.floor(Date.now() / 1000);

  // Main query definition
  const query = gql`
    query Token($tokenId: String!, $dateFilter: TokenDayData_filter, $pageSize: Int!, $skip: Int!) {
      token(id: $tokenId) {
        tokenDayData(
          first: $pageSize
          skip: $skip
          orderBy: date
          orderDirection: asc
          where: $dateFilter
        ) {
          date
          priceUSD
          totalLiquidityUSD
          dailyVolumeUSD
        }
      }
    }
  `;

  // Depending on the interval, we might need to iterate multiple times
  const intervalInSeconds = interval === 'hourly' ? 3600 : 86400;

  for (let timestamp = dayZeroTimestamp; timestamp <= currentTimestamp; timestamp += intervalInSeconds) {
    const variables = {
      tokenId,
      dateFilter: {
        date_gte: timestamp,
        date_lte: timestamp + intervalInSeconds,
      },
      pageSize,
      skip,
    };

    const response = await execute(query, variables);

    console.log(response, {
      date_gte: timestamp,
      date_lte: timestamp + intervalInSeconds,
    })

    // Append the fetched data to the allTokenDayData array
    allTokenDayData = allTokenDayData.concat(response.data.token.tokenDayData);
  }

  fs.writeFileSync(`./data.json`, JSON.stringify(allTokenDayData, null, 2));
}

// Call the function with the token ID and the interval
retrieveMarketIndicators('0x43c3ebafdf32909ac60e80ee34ae46637e743d65', 'hourly');
