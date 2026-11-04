export function useRegisterSW() {
  return {
    needRefresh: [false, () => {}] as [boolean, (reload?: boolean) => void],
    offlineReady: [false, () => {}] as [boolean, (reload?: boolean) => void],
    updateServiceWorker: async () => {},
  };
}
