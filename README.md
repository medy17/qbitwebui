# qbitwebui

<div align="center"> 
 <img width="200" height="200" alt="logo" src="https://github.com/user-attachments/assets/431cf92d-d8e6-4be7-a5b6-642ed6ab9898" />

### A modern web interface for managing multiple qBittorrent instances

Built with [React](https://react.dev/), [Hono](https://hono.dev/), and [Bun](https://bun.sh/)

[![GitHub stars](https://img.shields.io/github/stars/Maciejonos/qbitwebui?style=for-the-badge&labelColor=101418&color=9ccbfb)](https://github.com/Maciejonos/qbitwebui/stargazers)
[![GitHub License](https://img.shields.io/github/license/Maciejonos/qbitwebui?style=for-the-badge&labelColor=101418&color=abedd5)](https://github.com/Maciejonos/qbitwebui/blob/master/LICENSE)
[![GitHub release](https://img.shields.io/github/v/release/Maciejonos/qbitwebui?style=for-the-badge&labelColor=101418&color=b9c8da)](https://github.com/Maciejonos/qbitwebui/releases)
</div>

<div align="center">
  <img width="800" alt="demo1" src="https://github.com/user-attachments/assets/8eec9bf3-0b3e-4293-a8a7-d87d42e64cec" />
</div>

<details>
<summary><h3>More screenshots</h3></summary>

<div align="center">
  <img width="800" alt="demo4" src="https://github.com/user-attachments/assets/70ac1091-3487-414c-b0dd-1a1ae81688eb" />
  <img width="800" alt="demo5" src="https://github.com/user-attachments/assets/227ec87c-41a6-4c2d-9b0c-f83541ff1bcf" />
  <img width="800" alt="demo2" src="https://github.com/user-attachments/assets/959d2e89-b12d-4779-818e-7e21739787d5" />
  <img width="800" alt="demo3" src="https://github.com/user-attachments/assets/ba4c377e-2015-4ca5-bc0d-db283c828171" />
</div>

</details>

## Features

- **Multi-instance** - Manage multiple qBittorrent instances from one dashboard
- **Instance statistics** - Overview of all instances with status, speeds, torrent counts
- **User accounts** - Register/login with secure session management
- **Prowlarr integration** - Search indexers and send torrents directly to qBittorrent
- **Real-time monitoring** - Auto-refresh torrent status, speeds, progress
- **Customizable columns** - Show/hide columns, drag and drop reorder
- **Torrent management** - Add via magnet/file, set priorities, manage trackers/peers
- **Organization** - Filter by status, category, tag, or tracker
- **Bulk actions** - Multi-select with context menu, keyboard navigation
- **Themes** - Multiple color themes included
- **Encrypted storage** - qBittorrent credentials stored with AES-256-GCM

## Docker

```yaml
services:
  qbitwebui:
    image: ghcr.io/maciejonos/qbitwebui:latest
    ports:
      - "3000:3000"
    environment:
      # Generate your own: openssl rand -hex 32
      - ENCRYPTION_KEY=your-secret-key-here
      # Uncomment to allow HTTPS with self-signed certificates
      # - ALLOW_SELF_SIGNED_CERTS=true
    volumes:
      - ./data:/data
    restart: unless-stopped
```

Or build locally:

```bash
docker compose up -d
```

## Development

```bash
export ENCRYPTION_KEY=$(openssl rand -hex 32)

bun install
bun run dev
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ENCRYPTION_KEY` | Yes | - | Min 32 chars, used to encrypt stored credentials |
| `PORT` | No | `3000` | Server port |
| `DATABASE_PATH` | No | `./data/qbitwebui.db` | SQLite database location |
| `SALT_PATH` | No | `./data/.salt` | Encryption salt file location |
| `ALLOW_SELF_SIGNED_CERTS` | No | `false` | Set to `true` to allow HTTPS connections to qBittorrent instances with self-signed certificates |

## Tech Stack

React 19, TypeScript, Tailwind CSS v4, Vite, TanStack Query, Hono, SQLite, Bun

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Maciejonos/qbitwebui&type=date&legend=top-left)](https://www.star-history.com/#Maciejonos/qbitwebui&type=date&legend=top-left)

## License
MIT
