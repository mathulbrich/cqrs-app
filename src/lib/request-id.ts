import { randomUUID } from "crypto";

import { isArray } from "lodash";

import { REQUEST_ID_HEADER } from "@app/constants";

type Headers = { [key: string]: string | string[] | undefined };

const lowerCaseHeader = REQUEST_ID_HEADER.toLowerCase();

export const generateRequestId = (headers?: Headers): string => {
  const requestId = headers?.[REQUEST_ID_HEADER] ?? headers?.[lowerCaseHeader] ?? randomUUID();
  return /* istanbul ignore next */ isArray(requestId) ? requestId[0] : requestId;
};
