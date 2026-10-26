import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle, NotificationType } from "@capacitor/haptics";

/** Wibracja w aplikacji natywnej; w przeglądarce fallback na navigator.vibrate. */
export async function hapticSuccess() {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style: ImpactStyle.Light });
  } else {
    navigator.vibrate?.(30);
  }
}

export async function hapticError() {
  if (Capacitor.isNativePlatform()) {
    await Haptics.notification({ type: NotificationType.Error });
  } else {
    navigator.vibrate?.([60, 40, 60]);
  }
}

/** Krótkie „kliknięcie” przy tapnięciu w element nawigacji. */
export async function hapticTap() {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style: ImpactStyle.Medium });
  } else {
    navigator.vibrate?.(15);
  }
}
