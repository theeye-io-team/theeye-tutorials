
## Functional environment import

```

scp -P 2022 ./* user@127.0.0.1:/home/user/

```

## mongodump.tgz

database dump. contains files, tasks, workflows, users, etc

### Import database

```

ssh 127.0.0.1 -l user

cd /home/user/theeye-of-sauron/

mv mongodump.tgz /home/user/theeye-of-sauron/

tar -xzf mongodump.tgz

# if a previous dump exists
rm -rf mongodump/theeye-docs

mv theeye-docs mongodump/

# the directory mongodump should be created like this

user@theeye:~$ ls -l mongodump/
total 4
drwxr-xr-x 2 user user 4096 Nov 19 16:30 theeye-docs/

# import

docker exec -it theeye-mongodb mongorestore "/data/dump/"

```

done.

## scripts.tgz

Files and Scripts 


```

cd /home/user/theeye-of-sauron

tar -xzf scripts.tgz


```
