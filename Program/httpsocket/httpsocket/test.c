#pragma commnet(lib, "ws2_32.lib")
#define _WINSOCK_DEPRECATED_NO_WARNINGS
#include <WinSock2.h>
#include <Windows.h>
#include <stdio.h>
#include <string.h>
#include <conio.h>

int main() {
	WSADATA wsaData;
	char szLocalHostName[512];
	char ipAddress[48];
	struct hostent* pLocalHostInformaion;
	struct hostent* host;
	int i;

	if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0) {
		perror("WSAStartup Error");
		return -1;
	}

	printf("로컬 호스트의 이름을 얻음..\n");
	gethostname(szLocalHostName, sizeof(szLocalHostName));
	printf("로컬 호스트의 이름은 \"%s\"입니다.\n\n", szLocalHostName);

	pLocalHostInformaion = gethostbyname(szLocalHostName);

	for (i = 0; pLocalHostInformaion->h_addr_list[i] != NULL; i++) {
		char* str = inet_ntoa(*(struct in_addr*)pLocalHostInformaion->h_addr_list[i]);
		char* rem;
		strtok_s(str, ".", &rem);
		strtok_s(rem, ".", &str);
		strtok_s(str, ".", &rem);
		if (!strncmp(rem, "1", sizeof(rem)))
			continue;
		sprintf_s(ipAddress, sizeof(ipAddress), "%s", inet_ntoa(*(struct in_addr*)pLocalHostInformaion->h_addr_list[i]));
		printf("hostent.h_addr_list[%d] = %s\n", i, inet_ntoa(*(struct in_addr*)pLocalHostInformaion->h_addr_list[i]));
	}

	SOCKET sock = socket(PF_INET, SOCK_STREAM, 0);
	SOCKADDR_IN addr;

	if (sock == INVALID_SOCKET) {
		perror("Sock Error\n");
		return -1;
	}

	host = gethostbyname("localhost");
	addr.sin_family = AF_INET;
	addr.sin_port = htons(8181);
	addr.sin_addr.S_un.S_addr = inet_addr(inet_ntoa(*(struct in_addr*)*host->h_addr_list));
	//addr.sin_port = htons(8181);
	//addr.sin_addr.S_un.S_addr = inet_addr(inet_ntoa(*(struct in_addr*)"127.0.0.1"));
	
	if (connect(sock, (SOCKADDR*)&addr, sizeof(addr)) == SOCKET_ERROR) {
		printf("Connect Error\n");
		return 1;
	}
	char message[1024];
	char rep[1024];

	sprintf_s(message, sizeof(message), "GET /loginTest/joinResult.jsp?name=%s&ip=%s HTTP/1.1\r\nHost: localhost:8181\r\n\r\n", szLocalHostName, ipAddress );
	printf(message);
	send(sock, message, strlen(message), 0);
	recv(sock, rep, 1024, 0);

	printf("%s \n", rep);

	closesocket(sock);

	WSACleanup();

	return 0;
}