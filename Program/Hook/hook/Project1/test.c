#include <stdio.h>
#include <Windows.h>
#include <direct.h>
#include <string.h>

#define DEF_DLL_NAME "training_lock.dll"
#define DEF_INSTALLHOOK "InstallHook"
#define DEF_UNINSTALLHOOK "UninstallHook"

typedef void (*PFN_HOOKINSTALL)();
typedef void (*PFN_HOOKUNINSTALL)();

void main() {
	HWND hWnd = GetForegroundWindow();
	ShowWindow(hWnd, SW_HIDE);

	HMODULE hDll = NULL;
	PFN_HOOKINSTALL InstallHook = NULL;
	PFN_HOOKUNINSTALL UninstallHook = NULL;

	char strBuffer[260] = { 0, };
	char *picture = "\\prevention.jpg\"";
	char *pstrBuffer = NULL;
	
	hDll = LoadLibraryA(DEF_DLL_NAME);

	InstallHook = (PFN_HOOKINSTALL)GetProcAddress(hDll, DEF_INSTALLHOOK);
	UninstallHook = (PFN_HOOKUNINSTALL)GetProcAddress(hDll, DEF_UNINSTALLHOOK);

	pstrBuffer = _getcwd(strBuffer, 200);
	
	if (pstrBuffer) {
		char command[300] = "cmd /c \"";
		char buffer[300];

		strcat_s(command, sizeof(strBuffer), strBuffer);
		sprintf_s(buffer, sizeof(buffer), "%s%s", command, picture);

		WinExec(buffer, SW_SHOWMAXIMIZED);
	}
	Sleep(3000);

	InstallHook();

	Sleep(30000);

	UninstallHook();

	FreeLibrary(hDll);
}