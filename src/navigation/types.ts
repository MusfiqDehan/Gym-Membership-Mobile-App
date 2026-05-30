export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  PaymentWebView: { url: string; mode: 'register' | 'renew'; title?: string };
  InvoiceWebView: { url: string; headers: Record<string, string>; title?: string };
  Tabs: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Classes: undefined;
  Progress: undefined;
  Reviews: undefined;
  Subscription: undefined;
};
