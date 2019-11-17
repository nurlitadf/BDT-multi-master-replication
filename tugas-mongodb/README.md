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
  * Modifikasi `Vagrantfile` menjadi seperti berikut
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
    * Buat script bash `allhosts.sh` untuk provision semua host 
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
    * Buat script bash `mongo_config_1.sh` untuk provision host `mongo-config-1`
        ```bash
        sudo bash /vagrant/bash/allhosts.sh

        # Override mongod config with current config
        sudo cp /vagrant/config/mongodcsvr1.conf /etc/mongod.conf

        # Restart the mongo service 
        sudo systemctl restart mongod
        ```
    * Buat script bash `mongo_config_2.sh` untuk provision host `mongo-config-2`
        ```bash
        sudo bash /vagrant/bash/allhosts.sh

        # Override mongod config with current config
        sudo cp /vagrant/config/mongodcsvr2.conf /etc/mongod.conf

        # Restart the mongo service 
        sudo systemctl restart mongod
        ```
    * Buat script bash `mongo_config_3.sh` untuk provision host `mongo-config-3`
        ```bash
        sudo bash /vagrant/bash/allhosts.sh

        # Override mongod config with current config
        sudo cp /vagrant/config/mongodcsvr3.conf /etc/mongod.conf

        # Restart the mongo service 
        sudo systemctl restart mongod
        ```