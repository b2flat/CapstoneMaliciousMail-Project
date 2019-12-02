#include <stdio.h>
#include <windows.h>

HINSTANCE g_hInstance = NULL;
HHOOK g_kHook = NULL;
HHOOK g_mHook = NULL;

BOOL WINAPI DllMain(HINSTANCE hinstDLL, DWORD dwReason, LPVOID lpvReserved) {
	switch (dwReason)
	{
	case DLL_PROCESS_ATTACH:
		g_hInstance = hinstDLL;
		break;
	case DLL_PROCESS_DETACH:
		break;
	}
	return TRUE;
}

LRESULT CALLBACK KeyboardProc(int nCode, WPARAM wParam, LPARAM lParam) {
	if (nCode >= 0 || wParam == VK_TAB || wParam == VK_MENU || wParam == VK_DELETE || wParam == VK_CONTROL)
		return 1;
}
	
LRESULT CALLBACK MouseProc(int nCode, WPARAM wParam, LPARAM lParam) {
	if (wParam == WM_LBUTTONDBLCLK || wParam == WM_RBUTTONDBLCLK)
		return 1;
}

extern "C" __declspec(dllexport) void InstallHook() {
	g_kHook = SetWindowsHookEx(WH_KEYBOARD, KeyboardProc, g_hInstance, 0);
	g_mHook = SetWindowsHookEx(WH_MOUSE, MouseProc, g_hInstance, 0);
}

extern "C" __declspec(dllexport) void UninstallHook() {
	if (g_kHook) {
		UnhookWindowsHookEx(g_kHook);
		g_kHook = NULL;
	}
	if (g_mHook) {
		UnhookWindowsHookEx(g_mHook);
		g_mHook = NULL;
	}
}