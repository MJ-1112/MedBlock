import { MedicalRecord, BlockchainTransaction } from '../types';

// Simulated blockchain implementation
class HealthcareBlockchain {
  private chain: BlockchainTransaction[] = [];
  private difficulty = 2;

  constructor() {
    this.createGenesisBlock();
  }

  private createGenesisBlock() {
    const genesisBlock: BlockchainTransaction = {
      id: '0',
      hash: '0000000000000000000000000000000000000000000000000000000000000000',
      previousHash: '',
      timestamp: new Date().toISOString(),
      data: {
        id: 'genesis',
        patientId: '',
        doctorId: '',
        type: 'diagnosis',
        title: 'Genesis Block',
        description: 'Healthcare Blockchain Genesis Block',
        blockchainHash: '',
        timestamp: new Date().toISOString()
      },
      nonce: 0
    };
    this.chain.push(genesisBlock);
  }

  private calculateHash(
    id: string,
    previousHash: string,
    timestamp: string,
    data: MedicalRecord,
    nonce: number
  ): string {
    const content = id + previousHash + timestamp + JSON.stringify(data) + nonce;
    // Simple hash simulation (in real blockchain, use SHA-256)
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0');
  }

  private mineBlock(block: BlockchainTransaction): void {
    const target = Array(this.difficulty + 1).join('0');
    
    while (block.hash.substring(0, this.difficulty) !== target) {
      block.nonce++;
      block.hash = this.calculateHash(
        block.id,
        block.previousHash,
        block.timestamp,
        block.data,
        block.nonce
      );
    }
  }

  addRecord(record: MedicalRecord): string {
    const previousBlock = this.chain[this.chain.length - 1];
    
    const newBlock: BlockchainTransaction = {
      id: this.chain.length.toString(),
      hash: '',
      previousHash: previousBlock.hash,
      timestamp: new Date().toISOString(),
      data: record,
      nonce: 0
    };

    this.mineBlock(newBlock);
    this.chain.push(newBlock);
    
    return newBlock.hash;
  }

  getRecordsByPatient(patientId: string): MedicalRecord[] {
    return this.chain
      .filter(block => block.data.patientId === patientId)
      .map(block => ({ ...block.data, blockchainHash: block.hash }));
  }

  getRecordsByDoctor(doctorId: string): MedicalRecord[] {
    return this.chain
      .filter(block => block.data.doctorId === doctorId)
      .map(block => ({ ...block.data, blockchainHash: block.hash }));
  }

  verifyChain(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      const recalculatedHash = this.calculateHash(
        currentBlock.id,
        currentBlock.previousHash,
        currentBlock.timestamp,
        currentBlock.data,
        currentBlock.nonce
      );

      if (currentBlock.hash !== recalculatedHash) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getChainInfo() {
    return {
      length: this.chain.length,
      isValid: this.verifyChain(),
      lastBlock: this.chain[this.chain.length - 1]
    };
  }
}

export const healthcareBlockchain = new HealthcareBlockchain();