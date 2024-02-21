# База управления книгами в telegram боте

## Установка 
> **Ubuntu** - Можно воспользоваться готовым скриптом ниже, но надо до этого установить [golang](https://go.dev/), icu 
> 
> **Other** - Нужно установить [golang](https://go.dev/), [bun](https://bun.sh/), git, icu
```sh
# Установка для ubuntu ( до этого обязательно надо установить golang)
apt install curl unzip git
curl -fsSL https://bun.sh/install | bash
git clone https://github.com/XdYoXd/task
source ~/.bashrc
cd task/bot && bun install && cd ..
cd api && rm go.sum go.mod ; go mod init books && go mod tidy ; cd ..

# Скрипт для установки на другой дистрибутив linux (надо установить bun, golang, git)
git clone https://github.com/XdYoXd/task
source ~/.bashrc
cd task/bot && bun install && cd ..
cd api && rm go.sum go.mod ; go mod init books && go mod tidy ; cd ..
```

## Запуск 
Нужно заменить в config.yml BOT_TOKEN на токен телеграм бота  
Запустить бот и апи можно используя [Makefile](https://linuxhandbook.com/using-make/).
```sh
# Запуск бота:
make bot
# Запуск api (нужен для работы бота):
make api
# Запуск тестов:
make tests
```

![image](https://github.com/XdYoXd/task/assets/154287781/8124052f-6f10-4281-bc43-4acfaa5a1c69)

