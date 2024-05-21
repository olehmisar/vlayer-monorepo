import { JSONRPCRequest, JSONRPCServer, TypedJSONRPCServer } from 'json-rpc-2.0';
import Fastify from 'fastify';
import http from 'http';
import { JSONRPCServerMethods, ServerParams, getOracleHandler } from './handlers.js';
import { MultiChainClient } from '../../../ethereum/client.js';
import { getHeaderOracle } from '../headerOracle.js';
import { getAccountOracle } from '../accountOracle.js';
import { getProofOracle } from '../proofOracle.js';
import { getReceiptOracle } from '../receiptOracle.js';
import { getTransactionOracle } from '../transactionOracle.js';
import { getAccountWithStorageRecursiveOracle } from '../getAccountWithStorageRecursiveOracle.js';

const HTTP_STATUS_NO_CONTENT = 204;

const jsonRPCServer: TypedJSONRPCServer<JSONRPCServerMethods, ServerParams> = new JSONRPCServer();
jsonRPCServer.addMethod('get_header', getOracleHandler.bind(this, getHeaderOracle));
jsonRPCServer.addMethod('get_account', getOracleHandler.bind(this, getAccountOracle));
jsonRPCServer.addMethod('get_proof', getOracleHandler.bind(this, getProofOracle));
jsonRPCServer.addMethod('get_receipt', getOracleHandler.bind(this, getReceiptOracle));
jsonRPCServer.addMethod('get_transaction', getOracleHandler.bind(this, getTransactionOracle));
jsonRPCServer.addMethod(
  'get_account_with_storage_recursive',
  getOracleHandler.bind(this, getAccountWithStorageRecursiveOracle)
);

export function buildOracleServer(
  opts: Fastify.FastifyHttpOptions<http.Server> = {},
  multiChainClient: MultiChainClient = MultiChainClient.from_env()
): Fastify.FastifyInstance {
  const app = Fastify(opts);
  const serverParams = { client: multiChainClient };

  app.post('/', async (request, reply) => {
    const jsonRPCRequest = request.body as JSONRPCRequest;
    request.log.info({ jsonRPCRequest }, 'Received request');

    await jsonRPCServer.receive(jsonRPCRequest, serverParams).then(async (jsonRPCResponse) => {
      if (jsonRPCResponse) {
        await reply.send(jsonRPCResponse);
      } else {
        await reply.status(HTTP_STATUS_NO_CONTENT).send();
      }
    });
  });

  return app;
}
