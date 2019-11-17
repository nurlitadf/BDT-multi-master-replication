# BDT - Tugas MongoDB

## Desain dan Implementasi Infrastruktur

### Desain Infrastruktur
    
* Jumlah Server
  * Server config sebanyak `3` buah
  * Query Router sebanyak `1` buah
  * Server shard/data sebanyak `2` buah

* Spesifikasi Hardware
  * Server config
    * Menggunakan `bento/ubuntu-18.04`
    * RAM `512` MB
  * Query router
    * Menggunakan `bento/ubuntu-18.04`
    * RAM `512` MB
  * Server shard/data
      * Menggunakan `bento/ubuntu-18.04`
      * RAM `512` MB
  
* Pembagian IP
  * Server config
    * mongo-config-1 = `192.168.2.2`
    * mongo-config-2 = `192.168.2.3`
    * mongo-config-3 = `192.168.2.4`
  * Query router
    * mongo-query-router = `192.168.2.5`
  * Server shard/data
    * mongo-shard-1 = `192.168.2.6`
    * mongo-shard-2 = `192.168.2.7`
  
### Implementasi Infrastruktur
* Aplikasi yang dibutuhkan
  * Vagrant
  * Oracle VM VirtualBox
  
* Langkah-Langkah Implementasi
  * Menginisialisasi `Vagrantfile`
    ```bash
    vagrant init
    ```
    Modifikasi `Vagrantfile` menjadi seperti berikut
    ```ruby
        # -*- mode: ruby -*-
        # vi: set ft=ruby :

        Vagrant.configure("2") do |config|

            (1..2).each do |i|
                config.vm.define "mongo_config_#{i}" do |node|
                node.vm.hostname = "mongo-config-#{i}"
                node.vm.box = "bento/ubuntu-18.04"
                node.vm.network "private_network", ip: "192.168.2.#{i+1}"
        
                node.vm.provider "virtualbox" do |vb|
                    vb.name = "mongo-config-#{i}"
                    vb.gui = false
                    vb.memory = "512"
                end
        
                node.vm.provision "shell", path: "bash/mongo_config_#{i}.sh", privileged: false
                end
            end
        
            config.vm.define "mongo_query_router" do |mongo_query_router|
                mongo_query_router.vm.hostname = "mongo-query-router"
                mongo_query_router.vm.box = "bento/ubuntu-18.04"
                mongo_query_router.vm.network "private_network", ip: "192.168.2.4"
                
                mongo_query_router.vm.provider "virtualbox" do |vb|
                vb.name = "mongo-query-router"
                vb.gui = false
                vb.memory = "512"
                end
        
                mongo_query_router.vm.provision "shell", path: "bash/mongo_query_router.sh", privileged: false
            end
        
            (1..3).each do |i|
                config.vm.define "mongo_shard_#{i}" do |node|
                node.vm.hostname = "mongo-shard-#{i}"
                node.vm.box = "bento/ubuntu-18.04"
                node.vm.network "private_network", ip: "192.168.2.#{4+i}"
                    
                node.vm.provider "virtualbox" do |vb|
                vb.name = "mongo-shard-#{i}"
                vb.gui = false
                vb.memory = "512"
                end
        
                node.vm.provision "shell", path: "bash/mongo_shard_#{i}.sh", privileged: false
                end
            end
        
        end
    ```      
  * Membuat Script Provision
    * Buat script bash `bash/allhosts.sh` untuk provision semua host 
        ```bash
        # Add hostname
        sudo cp /vagrant/sources/hosts /etc/hosts

        # Copy APT sources list
        sudo cp '/vagrant/sources/sources.list' '/etc/apt/'
        sudo cp '/vagrant/sources/mongodb.list' '/etc/apt/sources.list.d/'

        echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf > /dev/null

        sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv 4B7C549A058F8B6B

        # Update Repository
        sudo apt-get update
        # sudo apt-get upgrade -y

        # Install MongoDB
        sudo apt-get install -y mongodb-org

        sudo mkdir -p /var/run/mongodb
        sudo touch /var/run/mongodb/mongod.pid
        sudo chown -R  mongodb:mongodb /var/run/mongodb/
        sudo chown mongodb:mongodb /var/run/mongodb/mongod.pid

        # Start MongoDB
        sudo service mongod start
        ```
    * Buat script bash `bash/mongo_config_1.sh` untuk provision host `mongo-config-1`
        ```bash
        sudo bash /vagrant/bash/allhosts.sh

        # Override mongod config with current config
        sudo cp /vagrant/config/mongodcsvr1.conf /etc/mongod.conf

        # Restart the mongo service 
        sudo systemctl restart mongod
        ```
    * Buat script bash `bash/mongo_config_2.sh` untuk provision host `mongo-config-2`
        ```bash
        sudo bash /vagrant/bash/allhosts.sh

        # Override mongod config with current config
        sudo cp /vagrant/config/mongodcsvr2.conf /etc/mongod.conf

        # Restart the mongo service 
        sudo systemctl restart mongod
        ```
    * Buat script bash `bash/mongo_query_router.sh` untuk provision host `mongo-query-router`
        ```bash
        sudo bash /vagrant/bash/allhosts.sh

        # Override mongod config with current config
        sudo cp /vagrant/config/mongos.conf /etc/mongos.conf

        # Create new service file
        sudo touch /lib/systemd/system/mongos.service
        sudo cp /vagrant/service/mongos.service /lib/systemd/system/mongos.service

        # Stop current mongo service
        sudo systemctl stop mongod

        # Enable mongos.service
        sudo systemctl enable mongos.service
        sudo systemctl start mongos

        # Confirm mongos is running
        systemctl status mongos
        ```
    * Buat script bash `bash/mongo_shard_1.sh` untuk provision host `mongo-shard-1`
        ```bash
        sudo bash /vagrant/bash/allhosts.sh

        # Override mongod config with current config
        sudo cp /vagrant/config/mongodshardsvr1.conf /etc/mongod.conf

        # Restart the mongo service 
        sudo systemctl restart mongod
        ```
    * Buat script bash `bash/mongo_shard_2.sh` untuk provision host `mongo-shard-2`
        ```bash
        sudo bash /vagrant/bash/allhosts.sh

        # Override mongod config with current config
        sudo cp /vagrant/config/mongodshardsvr2.conf /etc/mongod.conf

        # Restart the mongo service 
        sudo systemctl restart mongod
        ```
    * Buat script bash `bash/mongo_shard_3.sh` untuk provision host `mongo-shard-3`
        ```bash
        sudo bash /vagrant/bash/allhosts.sh

        # Override mongod config with current config
        sudo cp /vagrant/config/mongodshardsvr3.conf /etc/mongod.conf

        # Restart the mongo service 
        sudo systemctl restart mongod
        ```
  * Membuat File Konfigurasi
    * Buat file konfigurasi `config/mongodcsvr1.conf` untuk konfigurasi host `mongo-config-1`
        ```ini
        # mongod.conf

        # for documentation of all options, see:
        #   http://docs.mongodb.org/manual/reference/configuration-options/

        # where to write logging data.
        systemLog:
            destination: file
            logAppend: true
            path: /var/log/mongodb/mongod.log

        # Where and how to store data.
        storage:
            dbPath: /var/lib/mongodb
            journal:
                enabled: true
        #  engine:
        #  wiredTiger:

        # how the process runs
        processManagement:
            timeZoneInfo: /usr/share/zoneinfo

        # network interfaces
        net:
            port: 27019
            bindIp: 192.168.2.2

        #security:

        #operationProfiling:

        replication:
            replSetName: configReplSet

        sharding:
            clusterRole: "configsvr"

        ## Enterprise-Only Options

        #auditLog:

        #snmp:
        ```
    * Buat file konfigurasi `config/mongodcsvr2.conf` untuk konfigurasi host `mongo-config-2`
        ```ini
        # mongod.conf

        # for documentation of all options, see:
        #   http://docs.mongodb.org/manual/reference/configuration-options/

        # where to write logging data.
        systemLog:
            destination: file
            logAppend: true
            path: /var/log/mongodb/mongod.log

        # Where and how to store data.
        storage:
            dbPath: /var/lib/mongodb
            journal:
                enabled: true
        #  engine:
        #  wiredTiger:

        # how the process runs
        processManagement:
            timeZoneInfo: /usr/share/zoneinfo

        # network interfaces
        net:
            port: 27019
            bindIp: 192.168.2.3


        #security:
        #  keyFile: /opt/mongo/mongodb-keyfile

        #operationProfiling:

        replication:
            replSetName: configReplSet

        sharding:
            clusterRole: "configsvr"

        ## Enterprise-Only Options

        #auditLog:

        #snmp:
        ```
    * Buat file konfigurasi `config/mongos.conf` untuk konfigurasi host `mongo-query-router`
        ```ini
        # where to write logging data.
        systemLog:
            destination: file
            logAppend: true
            path: /var/log/mongodb/mongos.log

        # network interfaces
        net:
            port: 27017
            bindIp: 192.168.2.4

        sharding:
            configDB: configReplSet/mongo-config-1:27019,mongo-config-2:27019
        ```
    * Buat file konfigurasi `config/mongodshardsvr1.conf` untuk konfigurasi host `mongo-shard-1`
        ```ini
        # mongod.conf

        # for documentation of all options, see:
        #   http://docs.mongodb.org/manual/reference/configuration-options/

        # where to write logging data.
        systemLog:
            destination: file
            logAppend: true
            path: /var/log/mongodb/mongod.log

        # Where and how to store data.
        storage:
            dbPath: /var/lib/mongodb
            journal:
                enabled: true
        #  engine:
        #  wiredTiger:

        # how the process runs
        processManagement:
            timeZoneInfo: /usr/share/zoneinfo

        # network interfaces
        net:
            port: 27017
            bindIp: 192.168.2.5


        #security:

        #operationProfiling:

        #replication:

        sharding:
            clusterRole: "shardsvr"

        ## Enterprise-Only Options

        #auditLog:

        #snmp:
        ```
    * Buat file konfigurasi `config/mongodshardsvr2.conf` untuk konfigurasi host `mongo-shard-2`
        ```ini
        # mongod.conf

        # for documentation of all options, see:
        #   http://docs.mongodb.org/manual/reference/configuration-options/

        # where to write logging data.
        systemLog:
            destination: file
            logAppend: true
            path: /var/log/mongodb/mongod.log

        # Where and how to store data.
        storage:
            dbPath: /var/lib/mongodb
            journal:
                enabled: true
        #  engine:
        #  wiredTiger:

        # how the process runs
        processManagement:
            timeZoneInfo: /usr/share/zoneinfo

        # network interfaces
        net:
            port: 27017
            bindIp: 192.168.2.6


        #security:

        #operationProfiling:

        #replication:

        sharding:
            clusterRole: "shardsvr"

        ## Enterprise-Only Options

        #auditLog:

        #snmp:
        ```
    * Buat file konfigurasi `config/mongodshardsvr3.conf` untuk konfigurasi host `mongo-shard-3`
        ```ini
        # mongod.conf

        # for documentation of all options, see:
        #   http://docs.mongodb.org/manual/reference/configuration-options/

        # where to write logging data.
        systemLog:
            destination: file
            logAppend: true
            path: /var/log/mongodb/mongod.log

        # Where and how to store data.
        storage:
            dbPath: /var/lib/mongodb
            journal:
                enabled: true
        #  engine:
        #  wiredTiger:

        # how the process runs
        processManagement:
            timeZoneInfo: /usr/share/zoneinfo

        # network interfaces
        net:
            port: 27017
            bindIp: 192.168.2.7


        #security:

        #operationProfiling:

        #replication:

        sharding:
            clusterRole: "shardsvr"

        ## Enterprise-Only Options

        #auditLog:

        #snmp:
        ```
  * Membuat File Pendukung Lainnya
    * Membuat file `service/mongos.service`
        ```ini
        [Unit]
        Description=Mongo Cluster Router
        After=network.target

        [Service]
        User=mongodb
        Group=mongodb
        ExecStart=/usr/bin/mongos --config /etc/mongos.conf
        # file size
        LimitFSIZE=infinity
        # cpu time
        LimitCPU=infinity
        # virtual memory size
        LimitAS=infinity
        # open files
        LimitNOFILE=64000
        # processes/threads
        LimitNPROC=64000
        # total threads (user+kernel)
        TasksMax=infinity
        TasksAccounting=false

        [Install]
        WantedBy=multi-user.target
        ```
    * Membuat file `sources/hosts`
        ```ini
        192.168.2.2 mongo-config-1
        192.168.2.3 mongo-config-2
        192.168.2.4 mongo-query-router
        192.168.2.5 mongo-shard-1
        192.168.2.6 mongo-shard-2
        192.168.2.7 mongo-shard-3
        ```
    * Membuat file `sources/mongodb.list`
        ```ini
        deb [ arch=amd64 ] https://repo.mongodb.org/apt/ubuntu bionic/mongodb-org/4.2 multiverse
        ```
    * Membuat file `sources/sources.list`
        ```bash
        ## Note, this file is written by cloud-init on first boot of an instance
        ## modifications made here will not survive a re-bundle.
        ## if you wish to make changes you can:
        ## a.) add 'apt_preserve_sources_list: true' to /etc/cloud/cloud.cfg
        ##     or do the same in user-data
        ## b.) add sources in /etc/apt/sources.list.d
        ## c.) make changes to template file /etc/cloud/templates/sources.list.tmpl

        # See http://help.ubuntu.com/community/UpgradeNotes for how to upgrade to
        # newer versions of the distribution.
        # deb http://archive.ubuntu.com/ubuntu bionic main restricted
        # deb-src http://archive.ubuntu.com/ubuntu bionic main restricted

        deb http://boyo.its.ac.id/ubuntu bionic main restricted

        ## Major bug fix updates produced after the final release of the
        ## distribution.
        # deb http://archive.ubuntu.com/ubuntu bionic-updates main restricted
        # deb-src http://archive.ubuntu.com/ubuntu bionic-updates main restricted

        deb http://boyo.its.ac.id/ubuntu bionic-updates main restricted

        ## N.B. software from this repository is ENTIRELY UNSUPPORTED by the Ubuntu
        ## team. Also, please note that software in universe WILL NOT receive any
        ## review or updates from the Ubuntu security team.
        # deb http://archive.ubuntu.com/ubuntu bionic universe
        # deb-src http://archive.ubuntu.com/ubuntu bionic universe
        # deb http://archive.ubuntu.com/ubuntu bionic-updates universe
        # deb-src http://archive.ubuntu.com/ubuntu bionic-updates universe

        deb http://boyo.its.ac.id/ubuntu bionic universe
        deb http://boyo.its.ac.id/ubuntu bionic-updates universe

        ## N.B. software from this repository is ENTIRELY UNSUPPORTED by the Ubuntu
        ## team, and may not be under a free licence. Please satisfy yourself as to
        ## your rights to use the software. Also, please note that software in
        ## multiverse WILL NOT receive any review or updates from the Ubuntu
        ## security team.
        # deb http://archive.ubuntu.com/ubuntu bionic multiverse
        # deb-src http://archive.ubuntu.com/ubuntu bionic multiverse
        # deb http://archive.ubuntu.com/ubuntu bionic-updates multiverse
        # deb-src http://archive.ubuntu.com/ubuntu bionic-updates multiverse

        deb http://boyo.its.ac.id/ubuntu bionic multiverse
        deb http://boyo.its.ac.id/ubuntu bionic-updates multiverse

        ## N.B. software from this repository may not have been tested as
        ## extensively as that contained in the main release, although it includes
        ## newer versions of some applications which may provide useful features.
        ## Also, please note that software in backports WILL NOT receive any review
        ## or updates from the Ubuntu security team.
        # deb http://archive.ubuntu.com/ubuntu bionic-backports main restricted universe multiverse
        # deb-src http://archive.ubuntu.com/ubuntu bionic-backports main restricted universe multiverse

        deb http://boyo.its.ac.id/ubuntu bionic-backports main restricted universe multiverse

        ## Uncomment the following two lines to add software from Canonical's
        ## 'partner' repository.
        ## This software is not part of Ubuntu, but is offered by Canonical and the
        ## respective vendors as a service to Ubuntu users.
        # deb http://archive.canonical.com/ubuntu bionic partner
        # deb-src http://archive.canonical.com/ubuntu bionic partner

        # deb http://security.ubuntu.com/ubuntu bionic-security main restricted
        # deb-src http://security.ubuntu.com/ubuntu bionic-security main restricted
        # deb http://security.ubuntu.com/ubuntu bionic-security universe
        # deb-src http://security.ubuntu.com/ubuntu bionic-security universe
        # deb http://security.ubuntu.com/ubuntu bionic-security multiverse
        # deb-src http://security.ubuntu.com/ubuntu bionic-security multiverse

        deb http://boyo.its.ac.id/ubuntu bionic-security main restricted
        deb http://boyo.its.ac.id/ubuntu bionic-security universe
        deb http://boyo.its.ac.id/ubuntu bionic-security multiverse
        ```
### Konfigurasi MongoDB Cluster
* Konfigurasi replica set
  * Masuk ke salah satu server config
    ```bash
    vagrant ssh mongo_config_1
    ```
  * Masuk ke mongo
    ```bash
    mongo mongo-config-1:27019
    ```
  * Inisialisasi replica set
    ```bash
    rs.initiate( { _id: "configReplSet", configsvr: true, members: [ { _id: 0, host: "mongo-config-1:27019" }, { _id: 1, host: "mongo-config-2:27019" }] } )
    ```
  * Cek hasil replica set
    ```bash
    rs.status()
    ```
    ![Hasil replica set](/tugas-mongodb/images/replicaset.png)

* Membuat user administrative
  * Masuk ke salah satu server config
    ```bash
    vagrant ssh mongo_config_1
    ```
  * Masuk ke mongo
    ```bash
    mongo mongo-config-1:27019
    ```
  * Masuk ke database admin
    ```bash
    use admin
    ```
  * Membuat user
    ```bash
    db.createUser({user: "mongo-admin", pwd: "password", roles:[{role: "root", db: "admin"}]})
    ```
* Menambahkan shard
  * Masuk ke salah satu shard
    ```bash
    vagrant ssh mongo_shard_1
    ```
  * Connect ke MongoDB milik `mongo-query-router`
    ```bash
    mongo mongo-query-router:27017 -u mongo-admin -p --authenticationDatabase admin
    ```
  * Menambahkan shard pada mongo
    ```bash
    sh.addShard( "mongo-shard-1:27017" )
    sh.addShard( "mongo-shard-2:27017" )
    sh.addShard( "mongo-shard-3:27017" )
    ```

* Mengaktifkan sharding pada database dan collection
  * Masuk ke salah satu shard
    ```bash
    vagrant ssh mongo_shard_1
    ```
  * Connect ke MongoDB milik `mongo-query-router`
    ```bash
    mongo mongo-query-router:27017 -u mongo-admin -p --authenticationDatabase admin
    ```
  * Membuat database pada MongoDB
    ```bash
    use forestfire
    ```
  * Mengaktifkan sharding pada database
    ```bash
    sh.enableSharding("forestfire")
    ```
  * Mengaktifkan sharding pada collection
    ```bash
    db.forestfireCollection.ensureIndex( { _id : "hashed" } )
    sh.shardCollection( "forestfire.forestfireCollection", { "_id" : "hashed" } )
    ```
### Import Data dan Uji Coba Menggunakan API
* Import Data
  * Ubah data .csv menjadi .json (https://www.csvjson.com/csv2json)
  * Memasukkan data ke dalam collection menggunakan script `insert-data.py` : 
    ```python
        import json
        from pymongo import MongoClient

        client = MongoClient('mongodb://192.168.2.4:27017/?retryWrites=false&authSource=admin', username='mongo-admin', password='password')
        db_forest = client["forestfire"]
        forest_collection = db_forest["forestfireCollection"]

        with open('amazon.json') as fp:
            data = fp.read()
            data_json = json.loads(data)
            for datas in data_json:
                forest_collection.insert_one(datas)
    ```
    ```bash
    python3 insert-data.py
    ```
  * Masuk ke salah satu shard
    ```bash
    vagrant ssh mongo_shard_1
    ```
  * Connect ke MongoDB milik `mongo-query-router`
    ```bash
    mongo mongo-query-router:27017 -u mongo-admin -p --authenticationDatabase admin
    ```
  * Masuk ke database
    ```bash
    use forestfire
    ```
  * Hitung banyaknya data pada collection
    ```bash
    db.forestfireCollection.count()
    ```
    ![Hasil count](/tugas-mongodb/images/count.png)
  * Melihat distribusi shard
    ```bash
    db.forestfireCollection.getShardDistribution()
    ```
    ![Distribusi shard](/tugas-mongodb/images/shard.png)
* Uji coba menggunakan API
  * Teknologi yang dibutuhkan
    * Postman
    * NodeJS
  * CRUD
    * Create

    ![API Create](/tugas-mongodb/images/create.png)
    * Read

    ![API Read](/tugas-mongodb/images/read.png)
    * Update

    ![API Update](/tugas-mongodb/images/update.png)

    Setelah update:

    ![Data Setelah Update](/tugas-mongodb/images/after.png)

    * Delete

    ![API Delete](/tugas-mongodb/images/delete.png)

    Setelah delete:

    ![Data Setelah delete](/tugas-mongodb/images/null.png)
  * Aggregation Query
    * Count berdasarkan year

    ![Count](/tugas-mongodb/images/cnt.png)
    * Distinct state

    ![Distinct](/tugas-mongodb/images/distinct.png)