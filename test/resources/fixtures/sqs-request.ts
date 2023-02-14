export const sendBatchBadRequest = `
    <SendMessageBatchResponse>
      <SendMessageBatchResult>
        <BatchResultErrorEntry>
            <Code>400</Code>
            <Id>1</Id>
            <SenderFault>true</SenderFault>
        </BatchResultErrorEntry>
      </SendMessageBatchResult>
      <ResponseMetadata>
        <RequestId>ca1ad5d0-8271-408b-8d0f-1351bf547e74</RequestId>
      </ResponseMetadata>
    </SendMessageBatchResponse>`;

export const sendBatchSuccessfully = `
    <SendMessageBatchResponse>
      <SendMessageBatchResult>
        <SendMessageBatchResultEntry>
          <MD5OfMessageBody>0e024d309850c78cba5eabbeff7cae71</MD5OfMessageBody>
        </SendMessageBatchResultEntry>
      </SendMessageBatchResult>
      <ResponseMetadata>
        <RequestId>ca1ad5d0-8271-408b-8d0f-1351bf547e74</RequestId>
      </ResponseMetadata>
    </SendMessageBatchResponse>`;
