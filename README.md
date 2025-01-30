# eMonitor
eMonitor is a browser extension that helps users understand and optimize their extension usage. 
It provides real-time analytics about installed browser extensions, tracking metrics like memory consumption, CPU usage, and network activity. Users can identify resource-heavy extensions, detect potential conflicts, and receive personalized recommendations for better browser performance.

## Planned Features
* Real-time performance monitoring
* Resource usage visualization
* Personalized optimization recommendations

## Architecture
[![](https://mermaid.ink/img/pako:eNp9U01v2zAM_SuCznWH5hgMBdymhwBxYcTJCszOgbZZW4glZZLcLGj630fb8UeWYTqJenxPjxT1yTOdI5_z90ofsxKMY5tFohgtW6eFgUPJniDbF0bXKo8TPgYsQvMhMmRv2uzRJHzX8ZqVC4OZE1qxzdN4Oig-66oiXBtLigtw0J8Q40qnWcHzQxyAggIlKsf8cDnyv6fm22NWGi3xXg45NwKz-A1TtsZfNVr3b_YR0wv-F_s6UtrhQ_zy26GyTXkSHeRUQCsllHVQVdAWTltX2_b8gEYK2-Tb3a3cLH5Fd6QeMtMZ6EivBM3ZSkjhMGdOX3raYjjc31OYVtXpv86pjcy797oKbho0QLMRQpUnagwDPw7QGZFZ5heFwQKohTvmeY_sHNEW2QU-szCKwwqs1KwB6FUmzlofDWdsYjMBZ9KfJs26pPHNauXsmDTxNkzVdtlOky1TDSa_mqMwnLzZSpDgD4HHScJ6M7yCT2P4IdxpmjK5Low6ZysN-cX5dtlBgd-bhspzQiLbHmg4kHyvN_yOS5oDEDn9ts-GkHBX0rwmfE7bHMw-4Yn6ojyonY5OKuNzZ2q84_TdirIP6lZyIYCKlv3hAdRPrSl8h8ri1x-q8zUl?type=png)](https://mermaid.live/edit#pako:eNp9U01v2zAM_SuCznWH5hgMBdymhwBxYcTJCszOgbZZW4glZZLcLGj630fb8UeWYTqJenxPjxT1yTOdI5_z90ofsxKMY5tFohgtW6eFgUPJniDbF0bXKo8TPgYsQvMhMmRv2uzRJHzX8ZqVC4OZE1qxzdN4Oig-66oiXBtLigtw0J8Q40qnWcHzQxyAggIlKsf8cDnyv6fm22NWGi3xXg45NwKz-A1TtsZfNVr3b_YR0wv-F_s6UtrhQ_zy26GyTXkSHeRUQCsllHVQVdAWTltX2_b8gEYK2-Tb3a3cLH5Fd6QeMtMZ6EivBM3ZSkjhMGdOX3raYjjc31OYVtXpv86pjcy797oKbho0QLMRQpUnagwDPw7QGZFZ5heFwQKohTvmeY_sHNEW2QU-szCKwwqs1KwB6FUmzlofDWdsYjMBZ9KfJs26pPHNauXsmDTxNkzVdtlOky1TDSa_mqMwnLzZSpDgD4HHScJ6M7yCT2P4IdxpmjK5Low6ZysN-cX5dtlBgd-bhspzQiLbHmg4kHyvN_yOS5oDEDn9ts-GkHBX0rwmfE7bHMw-4Yn6ojyonY5OKuNzZ2q84_TdirIP6lZyIYCKlv3hAdRPrSl8h8ri1x-q8zUl)

## Stack
- Chrome Extensions API
- ShadCn/UI
- TypeScript
- React
- Plasmo

## Preview

### Activity Tab
<img src="https://github.com/user-attachments/assets/e93605ff-a706-433a-98b4-ae292d4ec61c" alt="IMG_0248" width="300" />

### Extensions Tab
<img src="https://github.com/user-attachments/assets/0804489f-ef1f-4bc6-8446-5ede96e1b356" alt="IMG_0248" width="300" />

### Summary Tab
<img src="https://github.com/user-attachments/assets/09581702-4065-475e-b5c3-cdd4be3a1167" alt="IMG_0248" width="300" />


## Limitations
- chrome.webRequest only tracks requests where the initiator is explicitly the extension (e.g., background scripts).
- Content script requests (e.g., fetch() in a webpage context) are invisible to the extension unless we modify them (e.g., via header injection).

## Getting Started

First, run the development server:

```bash
pnpm dev
# or
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for the chrome browser, using manifest v3, use: `build/chrome-mv3-dev`.

You can start editing the popup by modifying `popup.tsx`. It should auto-update as you make changes. To add an options page, simply add a `options.tsx` file to the root of the project, with a react component default exported. Likewise to add a content page, add a `content.ts` file to the root of the project, importing some module and do some logic, then reload the extension on your browser.

For further guidance, [visit our Documentation](https://docs.plasmo.com/)

## Making production build

Run the following:

```bash
pnpm build
# or
npm run build
```

This should create a production bundle for your extension, ready to be zipped and published to the stores.

## Submit to the webstores

The easiest way to deploy your Plasmo extension is to use the built-in [bpp](https://bpp.browser.market) GitHub action. Prior to using this action however, make sure to build your extension and upload the first version to the store to establish the basic credentials. Then, simply follow [this setup instruction](https://docs.plasmo.com/framework/workflows/submit) and you should be on your way for automated submission!


## Development Status 🚧

Development is currently in progress. Stay tuned for updates and new features!
