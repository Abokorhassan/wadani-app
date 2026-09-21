# Backend contract

`waddani-mobile-api.openapi.json` is the OpenAPI 3.0.3 spec for the
**Waddani Mobile Auth API**, extracted from the Swagger UI at
https://api.wp-membership-system.com/docs/ on 2026-09-19.

Re-fetch it when the backend changes, so the diff shows what moved:

```bash
curl -s https://api.wp-membership-system.com/docs/swagger-ui-init.js \
  | python3 -c "import sys,json,re; s=sys.stdin.read(); i=s.index('\"swaggerDoc\"'); i=s.index('{', i+12); d=0; j=i
while True:
    c=s[j]
    if c=='{': d+=1
    elif c=='}':
        d-=1
        if d==0: break
    j+=1
print(json.dumps(json.loads(s[i:j+1]), indent=2))" > api-contract/waddani-mobile-api.openapi.json
```

See [docs/api-gaps.md](../docs/api-gaps.md) for where the app and this API
disagree, and what is still needed from the backend.
