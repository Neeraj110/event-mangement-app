import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import eventsReducer from "./slices/eventsSlice";
import passesReducer from "./slices/passesSlice";
import ticketsReducer from "./slices/ticketsSlice";
import dashboardReducer from "./slices/dashboardSlice";
import checkInReducer from "./slices/checkInSlice";
import purchasesReducer from "./slices/purchasesSlice";
import { apiSlice } from "./api/apiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    events: eventsReducer,
    passes: passesReducer,
    tickets: ticketsReducer,
    dashboard: dashboardReducer,
    checkIn: checkInReducer,
    purchases: purchasesReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
