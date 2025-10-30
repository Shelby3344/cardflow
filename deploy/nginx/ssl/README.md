# Certificados SSL

Coloque seus certificados SSL aqui:

- `certificate.crt` - Certificado SSL público
- `private.key` - Chave privada SSL
- `ca_bundle.crt` - (opcional) Cadeia de certificados intermediários

## Gerar certificado auto-assinado (desenvolvimento)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout private.key \
  -out certificate.crt \
  -subj "/C=BR/ST=SP/L=SaoPaulo/O=CardFlow/OU=Dev/CN=localhost"
```

## Certificado Let's Encrypt (produção)

Para produção, use **Certbot** para gerar certificados gratuitos SSL do Let's Encrypt.

```bash
sudo certbot --nginx -d cardflow.com -d www.cardflow.com
```
