# To backup
```
docker exec -t apan-postgres pg_dump -U admin -d db -f /tmp/backups/backup.sql --clean --if-exists
```

# To restore
```
pv backup.sql | docker exec -i apan-postgres psql -U admin -d db  
```
