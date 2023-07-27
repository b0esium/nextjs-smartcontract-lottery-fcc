import { useWeb3Contract, useMoralis } from "react-moralis"
import { abi, contractAddresses } from "../constants"
import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { useNotification } from "web3uikit"

const LotteryEntrance = () => {
    // manage state
    const [entranceFee, setEntranceFee] = useState("0")
    const [numPlayers, setNumPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()

    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const {
        runContractFunction: enterRaffle,
        data: isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        params: {},
        msgValue: entranceFee,
    })
    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getEntranceFee",
        params: {},
    })
    const { runContractFunction: getNumPlayers } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumPlayers",
        params: {},
    })
    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        const entranceFeeObj = await getEntranceFee({
            onError: (error) => console.log(error),
        })
        const entranceFeeString = entranceFeeObj._hex
        setEntranceFee(entranceFeeString)
        // players
        let numPlayersObj = await getNumPlayers({
            onError: (error) => console.log(error),
        })
        let numPlayersString = parseInt(numPlayersObj._hex)
        setNumPlayers(numPlayersString)
        // winner
        let recentWinnerObj = await getRecentWinner({
            onError: (error) => console.log(error),
        })
        // let recentWinnerString = recentWinnerObj._hex
        setRecentWinner(recentWinnerObj)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleSuccess = async function (tx) {
        await tx.wait(1)
        handleNewNotification(tx)
        updateUI()

        // now that there's at least one player, listen for winner pick event to be emitted by the contract
        const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")
        const contract = new ethers.Contract(raffleAddress, abi, provider)
        contract.on("WinnerPicked", (winnerAddress) => {
            setRecentWinner(winnerAddress)
        })
    }

    const handleNewNotification = function () {
        dispatch({
            type: "info",
            message: "Transaction complete!",
            title: "Tx Notification",
            position: "topR",
            icon: "bell",
        })
    }

    return (
        <div className="p-5">
            {raffleAddress ? (
                <div>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        onClick={async function () {
                            await enterRaffle({
                                // tx successfully sent to metamask
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            <div>Enter Raffle</div>
                        )}
                    </button>
                    <div>Entrance fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH</div>
                    <div>Number of players: {numPlayers}</div>
                    <div>Latest winner: {recentWinner}</div>
                </div>
            ) : (
                <div>No raffle contract detected</div>
            )}
        </div>
    )
}

export default LotteryEntrance
