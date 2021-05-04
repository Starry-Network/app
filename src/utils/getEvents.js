export async function getEvents(api, blockHash, pallet = "collectionModule") {
  console.log({api, blockHash, pallet})
  const signedBlock = await api.rpc.chain.getBlock(blockHash);
  const allRecords = await api.query.system.events.at(blockHash);

  const events = signedBlock.block.extrinsics.map((_v, index) => {
    const events = allRecords
      .filter(({ phase }) =>
        phase.isApplyExtrinsic &&
        phase.asApplyExtrinsic.eq(index)
      )
      .filter(({ event }) => event.section == pallet).map(event => event.toHuman()).map(({ event }) => {
        return {
          section: event.section,
          method: event.method,
          data: event.data
        }
      });
    return events
  }).filter(array => array.length > 0).map(array => array[0]);
  return events
}