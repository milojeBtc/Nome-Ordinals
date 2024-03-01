export interface MempoolTx {
    txid: string;
    version: number;
    locktime: number;
    vin: Vin[];
    vout: Prevout[];
    size: number;
    weight: number;
    fee: number;
    status: Status;
}

interface Status {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
}

interface Vin {
    txid: string;
    vout: number;
    prevout: Prevout;
    scriptsig: string;
    scriptsig_asm: string;
    witness: string[];
    is_coinbase: boolean;
    sequence: number;
    inner_witnessscript_asm: string;
}

interface Prevout {
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    scriptpubkey_address: string;
    value: number;
}
