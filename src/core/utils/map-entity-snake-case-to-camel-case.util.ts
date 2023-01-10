import { camelCase } from 'lodash';

export const mapEntitySnakeCaseToCamelCase = <T>(Class: new () => T, raw: unknown): T => {
  const entity: T = new Class()
  Object.keys(raw).forEach((snakeCasedKey) => {
    entity[camelCase(snakeCasedKey)] = raw[snakeCasedKey]
  });
  return entity;
}
