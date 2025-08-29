"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { useTheme } from "next-themes";
import type { ThirdwebContract } from "thirdweb";
import {
	ClaimButton,
	ConnectButton,
	MediaRenderer,
	NFTProvider,
	NFTMedia,
	useActiveAccount,
} from "thirdweb/react";
import { client } from "@/lib/thirdwebClient";
import { defaultChain } from "@/lib/constants";
import React from "react";
import { toast } from "sonner";
import { Skeleton } from "./ui/skeleton";

type Props = {
	contract: ThirdwebContract;
	displayName: string;
	description: string;
	contractImage: string;
	pricePerToken: number | null;
	currencySymbol: string | null;
	isERC1155: boolean;
	isERC721: boolean;
	tokenId: bigint;
};

export function NftMint(props: Props) {
	const [isMinting, setIsMinting] = useState(false);
	const [quantity, setQuantity] = useState(1);
	const { theme, setTheme } = useTheme();
	const account = useActiveAccount();

	const decreaseQuantity = () => {
		setQuantity((prev) => Math.max(1, prev - 1));
	};

	const increaseQuantity = () => {
		setQuantity((prev) => prev + 1);
	};

	const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = Number.parseInt(e.target.value);
		if (!Number.isNaN(value)) {
			setQuantity(Math.min(Math.max(1, value)));
		}
	};

	if (props.pricePerToken === null || props.pricePerToken === undefined) {
		console.error("Invalid pricePerToken");
		return null;
	}
	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-gradient-dark transition-colors duration-200">
			<div className="absolute top-4 right-4">
				<ConnectButton
					client={client}
					accountAbstraction={{
						chain: defaultChain,
						sponsorGas: true,
					}}
				/>
			</div>

			<Card className="w-full max-w-md border-border/50 shadow-2xl bg-card/95 backdrop-blur-sm">
				<CardContent className="pt-6">
					<div className="aspect-square overflow-hidden rounded-lg mb-4 relative">
						{props.isERC1155 ? (
							<NFTProvider contract={props.contract} tokenId={props.tokenId}>
								<NFTMedia
									loadingComponent={<Skeleton className="w-full h-full object-cover" />}
									className="w-full h-full object-cover" />
							</NFTProvider>
						) : (
							<MediaRenderer
								client={client}
								className="w-full h-full object-cover"
								alt=""
								src={
									props.contractImage || "/placeholder.svg?height=400&width=400"
								}
							/>
						)}
						<div className="absolute top-2 right-2 bg-gradient-blue text-primary-foreground px-3 py-1.5 rounded-full text-sm font-semibold backdrop-blur-sm shadow-lg">
							{props.pricePerToken} {props.currencySymbol}/each
						</div>
					</div>
					<h2 className="text-2xl font-bold mb-2 text-foreground">
						{props.displayName}
					</h2>
					<p className="text-muted-foreground mb-4">
						{props.description}
					</p>
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center">
							<Button
								variant="outline"
								size="icon"
								onClick={decreaseQuantity}
								disabled={quantity <= 1}
								aria-label="Decrease quantity"
								className="rounded-r-none border-border hover:bg-accent"
							>
								<Minus className="h-4 w-4" />
							</Button>
							<Input
								type="number"
								value={quantity}
								onChange={handleQuantityChange}
								className="w-28 text-center rounded-none border-x-0 pl-6 bg-background border-border focus:ring-primary"
								min="1"
							/>
							<Button
								variant="outline"
								size="icon"
								onClick={increaseQuantity}
								aria-label="Increase quantity"
								className="rounded-l-none border-border hover:bg-accent"
							>
								<Plus className="h-4 w-4" />
							</Button>
						</div>
						<div className="text-base pr-1 font-semibold text-foreground">
							Total: {props.pricePerToken * quantity} {props.currencySymbol}
						</div>
					</div>
				</CardContent>
				<CardFooter>
					{account ? (
						<ClaimButton
							theme={"dark"}
							contractAddress={props.contract.address}
							chain={props.contract.chain}
							client={props.contract.client}
							claimParams={
								props.isERC1155
									? {
										type: "ERC1155",
										tokenId: props.tokenId,
										quantity: BigInt(quantity),
										from: account.address,
									}
									: props.isERC721
										? {
											type: "ERC721",
											quantity: BigInt(quantity),
											from: account.address,
										}
										: {
											type: "ERC20",
											quantity: String(quantity),
											from: account.address,
										}
							}
							style={{
								background: "linear-gradient(135deg, hsl(220, 50%, 60%) 0%, hsl(210, 65%, 55%) 100%)",
								color: "white",
								width: "100%",
								borderRadius: "0.5rem",
								fontWeight: "600",
								boxShadow: "0 4px 14px 0 rgba(59, 130, 246, 0.3)",
							}}
							disabled={isMinting}
							onTransactionSent={() => toast.info("Minting NFT")}
							onTransactionConfirmed={() =>
								toast.success("Minted successfully")
							}
							onError={(err) => toast.error(err.message)}
						>
							Mint {quantity} NFT{quantity > 1 ? "s" : ""}
						</ClaimButton>
					) : (
						<ConnectButton
							client={client}
							connectButton={{ style: { width: "100%" } }}
						/>
					)}
				</CardFooter>
			</Card>
		</div>
	);
}
