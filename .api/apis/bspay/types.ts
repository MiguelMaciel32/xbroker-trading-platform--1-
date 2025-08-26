import type { FromSchema } from 'json-schema-to-ts';
import * as schemas from './schemas';

export type ConsultarTransaOBodyParam = FromSchema<typeof schemas.ConsultarTransaO.body>;
export type ConsultarTransaOResponse200 = FromSchema<typeof schemas.ConsultarTransaO.response['200']>;
export type ConsultarTransaOResponse400 = FromSchema<typeof schemas.ConsultarTransaO.response['400']>;
export type CreateQrcodeBodyParam = FromSchema<typeof schemas.CreateQrcode.body>;
export type CreateQrcodeResponse200 = FromSchema<typeof schemas.CreateQrcode.response['200']>;
export type CreateQrcodeResponse401 = FromSchema<typeof schemas.CreateQrcode.response['401']>;
export type FazerUmPagamentoBodyParam = FromSchema<typeof schemas.FazerUmPagamento.body>;
export type FazerUmPagamentoResponse200 = FromSchema<typeof schemas.FazerUmPagamento.response['200']>;
export type FazerUmPagamentoResponse400 = FromSchema<typeof schemas.FazerUmPagamento.response['400']>;
