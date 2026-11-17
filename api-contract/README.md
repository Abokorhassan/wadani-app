# Backend contract

`waddani-mobile-api.openapi.json` is the OpenAPI 3.0.3 spec for the
**Waddani Mobile Auth API**, extracted from the Swagger UI at
https://api.wp-membership-system.com/docs/ on 2026-09-19, and re-fetched on 2026-09-21
(plans gained `iconUrl` and `priceMax`; guest donations and an OTP-based password reset were added).
On 2026-11-17 it was regenerated from the backend source instead
(`platform/apps/api/src/api/openapi/mobileAuth.ts`, commit `60125c0`): free plans
make `amount` and `method` optional on register, and notifications and
`password/change` were added.

The docs page sits behind HTTP basic auth (the credentials come from the backend
developer and are deliberately not stored here), so the command needs `-u user:pass`.

Re-fetch it when the backend changes, so the diff shows what moved:

```bash
curl -s -u "$DOCS_USER:$DOCS_PASS" https://api.wp-membership-system.com/docs/swagger-ui-init.js \
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
