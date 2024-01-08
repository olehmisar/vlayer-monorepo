import { BarretenbergBackend, CompiledCircuit } from '@noir-lang/backend_barretenberg';
import { InputMap, Noir } from '@noir-lang/noir_js';
import noir_ethereum_history_api from '../../../circuit/target/noir_ethereum_history_api.json';
import { defaultOracles, Oracles } from './noir/oracles/oracles.js';

export interface MainInputs extends InputMap {
  block_no: number
  address: string[]
  state_root: string[]
}

export async function generate_and_verify_simple_proof(input: MainInputs, oracles: Oracles = defaultOracles) {
  const circuit = noir_ethereum_history_api as unknown as CompiledCircuit;
  const backend = new BarretenbergBackend(circuit);
  const noir = new Noir(circuit, backend);
  const proof = await noir.generateFinalProof(input, oracles);
  return await noir.verifyFinalProof(proof);
};
