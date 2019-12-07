# BDT - Tugas EAS
## Desain dan Implementasi Infrastruktur
### Desain Infrastruktur
* Server
  
  | Host | Aplikasi |
  ------- | --------- |
  node1 | PD, TiDB, node exporter, Grafana, Prometheus
  node2 | PD, node exporter
  node3 | PD, node exporter
  node4 | TiKV, node exporter
  node5 | TiKV, node exporter
  node6 | TiKV, node exporter

* Spesifikasi Hardware
  * Menggunakan `CentOS 7`
  * RAM `512` MB

* Pembagian IP
  * `node1` = `192.168.16.92`
  * `node2` = `192.168.16.93`
  * `node3` = `192.168.16.94`
  * `node4` = `192.168.16.95`
  * `node5` = `192.168.16.96`
  * `node6` = `192.168.16.97`

### Implementasi Infrastruktur
* Menginisialisasi `Vagrantfile`
  ```
  vagrant init
  ```
* Modifikasi `Vagrantfile`
    ```ruby
    # -*- mode: ruby -*-
    # vi: set ft=ruby :

    Vagrant.configure("2") do |config|
        (1..6).each do |i|
            config.vm.define "node#{i}" do |node|
            node.vm.hostname = "node#{i}"

            # Gunakan CentOS 7 dari geerlingguy yang sudah dilengkapi VirtualBox Guest Addition
            node.vm.box = "geerlingguy/centos7"
            node.vm.box_version = "1.2.19"
            
            # Disable checking VirtualBox Guest Addition agar tidak compile ulang setiap restart
            node.vbguest.auto_update = false
            
            node.vm.network "private_network", ip: "192.168.16.#{91+i}"
            node.vm.network "public_network", bridge: "wlp3s0"
            
            node.vm.provider "virtualbox" do |vb|
                vb.name = "node#{i}"
                vb.gui = false
                vb.memory = "512"
            end

            node.vm.provision "shell", path: "provision/bootstrap.sh", privileged: false
            end
        end
    end
  ```
* Membuat Script Provision `provision/bootstrap.sh`
    ```bash
    # Referensi:
    # https://pingcap.com/docs/stable/how-to/deploy/from-tarball/testing-environment/

    # Update the repositories
    # sudo yum update -y

    # Copy open files limit configuration
    sudo cp /vagrant/config/tidb.conf /etc/security/limits.d/

    # Enable max open file
    sudo sysctl -w fs.file-max=1000000

    # Copy atau download TiDB binary dari http://download.pingcap.org/tidb-v3.0-linux-amd64.tar.gz
    cp /vagrant/installer/tidb-v3.0-linux-amd64.tar.gz .

    # Extract TiDB binary
    tar -xzf tidb-v3.0-linux-amd64.tar.gz

    # Install MariaDB to get MySQL client
    sudo yum -y install mariadb

    # Install Git
    sudo yum -y install git

    # Install nano text editor
    sudo yum -y install nano

    # Install node exporter
    wget https://github.com/prometheus/node_exporter/releases/download/v0.18.1/node_exporter-0.18.1.linux-amd64.tar.gz
    tar -xzf node_exporter-0.18.1.linux-amd64.tar.gz

    ```
* Menjalankan Vagrant
  ```
  vagrant up
  ```
* Konfigurasi TiDB
  * Masuk ke `node1`
    ```
    vagrant ssh node1
    ```
    Jalankan command berikut
    ```bash
    cd tidb-v3.0-linux-amd64
    ```
    ```
    ./bin/pd-server --name=pd1 \
                    --data-dir=pd \
                    --client-urls="http://192.168.16.92:2379" \
                    --peer-urls="http://192.168.16.92:2380" \
                    --initial-cluster="pd1=http://192.168.16.92:2380,pd2=http://192.168.16.93:2380,pd3=http://192.168.16.94:2380" \
                    --log-file=pd.log &
    ```
  * Masuk ke `node2`
    ```
    vagrant ssh node2
    ```
    Jalankan command berikut
    ```bash
    cd tidb-v3.0-linux-amd64
    ```
    ```bash
    ./bin/pd-server --name=pd2 \
                --data-dir=pd \
                --client-urls="http://192.168.16.93:2379" \
                --peer-urls="http://192.168.16.93:2380" \
                --initial-cluster="pd1=http://192.168.16.92:2380,pd2=http://192.168.16.93:2380,pd3=http://192.168.16.94:2380" \
                --log-file=pd.log &
    ```
  * Masuk ke `node3`
    ```
    vagrant ssh node3
    ```
    Jalankan command berikut
    ```bash
    cd tidb-v3.0-linux-amd64
    ```
    ```bash
    ./bin/pd-server --name=pd3 \
                --data-dir=pd \
                --client-urls="http://192.168.16.94:2379" \
                --peer-urls="http://192.168.16.94:2380" \
                --initial-cluster="pd1=http://192.168.16.92:2380,pd2=http://192.168.16.93:2380,pd3=http://192.168.16.94:2380" \
                --log-file=pd.log &
    ```
  * Masuk ke `node4`
    ```
    vagrant ssh node4
    ```
    Jalankan command berikut
    ```bash
    cd tidb-v3.0-linux-amd64
    ```
    ```bash
    ./bin/tikv-server --pd="192.168.16.92:2379,192.168.16.93:2379,192.168.16.94:2379" \
                  --addr="192.168.16.95:20160" \
                  --data-dir=tikv \
                  --log-file=tikv.log &
    ```
  * Masuk ke `node5`
    ```
    vagrant ssh node5
    ```
    Jalankan command berikut
    ```bash
    cd tidb-v3.0-linux-amd64
    ```
    ```bash
    ./bin/tikv-server --pd="192.168.16.92:2379,192.168.16.93:2379,192.168.16.94:2379" \
                  --addr="192.168.16.96:20160" \
                  --data-dir=tikv \
                  --log-file=tikv.log &
    ```
  * Masuk ke `node6`
    ```
    vagrant ssh node6
    ```
    Jalankan command berikut
    ```bash
    cd tidb-v3.0-linux-amd64
    ```
    ```bash
    ./bin/tikv-server --pd="192.168.16.92:2379,192.168.16.93:2379,192.168.16.94:2379" \
                  --addr="192.168.16.97:20160" \
                  --data-dir=tikv \
                  --log-file=tikv.log &
    ```
  * Masuk ke `node1`
    ```
    vagrant ssh node1
    ```
    Jalankan command berikut
    ```bash
    cd tidb-v3.0-linux-amd64
    ```
    ```bash
    ./bin/tidb-server --store=tikv \
                  --path="192.168.16.92:2379" \
                  --log-file=tidb.log &
    ```

### Pemanfaatan Database pada API CRUD
* Create
  
    ![Create](/img/create.png)

* Read

    ![Read](/img/read.png)

* Update
    
    ![Update](/img/update.png)

* Delete

    ![Read](/img/delete.png)

### Uji Performa API

#### JMeter

* 100
  ![JMeter 100](/img/100.png)

* 500
  ![JMeter 500](/img/500.png)

* 1000
  ![JMeter 1000](/img/1000.png)

#### Sysbench

* Install sysbench dengan menjalankan command berikut
  ```
  git clone https://github.com/pingcap/tidb-bench.git
  ```
  ```
  curl -s https://packagecloud.io/install/repositories/akopytov/sysbench/script.rpm.sh | sudo bash
  sudo yum -y install sysbench
  ```
* Modifikasi file config sysbench
  ```
  cd tidb-bench/sysbench
  nano config
  ```
  ```ini
  time=300
  db-driver=mysql
  mysql-host=192.168.16.92
  mysql-port=4000
  mysql-user=root
  mysql-db=test
  report-interval=10
  ```
* Jalankan sysbench
  ```bash
  ./run.sh point_select prepare 16
  ./run.sh point_select run 16
  ```
* Untuk melihat log
  ```
  nano point_select_run_16.log
  ```

#### Hasil Sysbench

* 1PD
  Log = `logs/sysbench_run_1pd.log`
  ```ini
  SQL statistics:
    queries performed:
        read:                            2864153
        write:                           0
        other:                           0
        total:                           2864153
    transactions:                        2864153 (9546.97 per sec.)
    queries:                             2864153 (9546.97 per sec.)
    ignored errors:                      0      (0.00 per sec.)
    reconnects:                          0      (0.00 per sec.)

    General statistics:
        total time:                          300.0051s
        total number of events:              2864153

    Latency (ms):
            min:                                    0.23
            avg:                                    1.67
            max:                                   27.01
            95th percentile:                        2.81
            sum:                              4796853.61

    Threads fairness:
        events (avg/stddev):           179009.5625/205.49
        execution time (avg/stddev):   299.8034/0.01
  ```
* 2PD
  
  Log = `logs/sysbench_run_2pd.log`
    ```ini
    SQL statistics:
        queries performed:
            read:                            2641611
            write:                           0
            other:                           0
            total:                           2641611
        transactions:                        2641611 (8805.09 per sec.)
        queries:                             2641611 (8805.09 per sec.)
        ignored errors:                      0      (0.00 per sec.)
        reconnects:                          0      (0.00 per sec.)

    General statistics:
        total time:                          300.0082s
        total number of events:              2641611

    Latency (ms):
            min:                                    0.26
            avg:                                    1.82
            max:                                   51.97
            95th percentile:                        2.91
            sum:                              4797158.72

    Threads fairness:
        events (avg/stddev):           165100.6875/195.05
        execution time (avg/stddev):   299.8224/0.00
    ```
* 3PD
  
  Log = `logs/sysbench_run_3pd.log`
    ```
    SQL statistics:
        queries performed:
            read:                            2567577
            write:                           0
            other:                           0
            total:                           2567577
        transactions:                        2567577 (8558.44 per sec.)
        queries:                             2567577 (8558.44 per sec.)
        ignored errors:                      0      (0.00 per sec.)
        reconnects:                          0      (0.00 per sec.)

    General statistics:
        total time:                          300.0041s
        total number of events:              2567577

    Latency (ms):
            min:                                    0.27
            avg:                                    1.87
            max:                                   56.57
            95th percentile:                        3.19
            sum:                              4797173.03

    Threads fairness:
        events (avg/stddev):           160473.5625/212.43
        execution time (avg/stddev):   299.8233/0.00
    ```
Dapat dilihat dari hasil di atas bahwa semakin banyak PD semakin baik performanya.

#### Fail Over
* Masuk ke salah satu host lalu jalankan command
  ```bash
  curl http://192.168.16.92:2379/pd/api/v1/members
  ```
  ![Fail Over](/img/failover_1.png)
* Matikan pd pada host leader
  ```bash
  vagrant ssh node1
  ```
  ```
  ps -aux | grep pd
  ```
  ```
  sudo kill -9 [pid pd]
  ```
  ![Fail Over](/img/kill.png)
* Cek Leader Baru
  ```bash
  curl http://192.168.16.93:2379/pd/api/v1/members
  ```
  ![Fail Over](/img/failover_2.png)
Leader berpindah dari `pd1` ke `pd3`

### Monitoring Menggunakan Grafana

* Masuk ke dalam semua host dengan `vagrant ssh [nama host]` lalu jalankan command berikut di setiap host
  ```bash
  cd node_exporter-0.18.1.linux-amd64
  ```
  ```bash
  ./node_exporter --web.listen-address=":9100" \
    --log.level="info" &
  ```
* Masuk ke node 1
  ```bash
  vagrant ssh node1
  ```
  Jalankan command
  ```bash
  wget https://github.com/prometheus/prometheus/releases/download/v2.2.1/prometheus-2.2.1.linux-amd64.tar.gz
  wget https://dl.grafana.com/oss/release/grafana-6.5.1.linux-amd64.tar.gz

  tar -xzf prometheus-2.2.1.linux-amd64.tar.gz
  tar -zxf grafana-6.5.1.linux-amd64.tar.gz
  ```
  ```bash
  cd prometheus-2.2.1.linux-amd64
  ```
  ```bash
  rm prometheus.yml
  ```
  ```bash
  nano prometheus.yml
  ```
  Isi `prometheus.yml` dengan:
  ```
  global:
  scrape_interval:     15s  # By default, scrape targets every 15 seconds.
  evaluation_interval: 15s  # By default, scrape targets every 15 seconds.
  # scrape_timeout is set to the global default value (10s).
  external_labels:
    cluster: 'test-cluster'
    monitor: "prometheus"

    scrape_configs:
    - job_name: 'overwritten-nodes'
        honor_labels: true  # Do not overwrite job & instance labels.
        static_configs:
        - targets:
        - '192.168.16.92:9100'
        - '192.168.16.93:9100'
        - '192.168.16.94:9100'
        - '192.168.16.95:9100'
        - '192.168.16.96:9100'
        - '192.168.16.97:9100'

    - job_name: 'tidb'
        honor_labels: true  # Do not overwrite job & instance labels.
        static_configs:
        - targets:
        - '192.168.16.92:10080'

    - job_name: 'pd'
        honor_labels: true  # Do not overwrite job & instance labels.
        static_configs:
        - targets:
        - '192.168.16.92:2379'
        - '192.168.16.93:2379'
        - '192.168.16.94:2379'

    - job_name: 'tikv'
        honor_labels: true  # Do not overwrite job & instance labels.
        static_configs:
        - targets:
        - '192.168.16.95:20180'
        - '192.168.16.96:20180'
        - '192.168.16.97:20180'
  ```
* Jalankan prometheus dengan command berikut
  ```bash
  ./prometheus \
    --config.file="./prometheus.yml" \
    --web.listen-address=":9090" \
    --web.external-url="http://192.168.16.92:9090/" \
    --web.enable-admin-api \
    --log.level="info" \
    --storage.tsdb.path="./data.metrics" \
    --storage.tsdb.retention="15d" &
  ```
* Tambahkan `grafana.ini`
  ```bash
  cd ..
  ```
  ```bash
  cd grafana-6.5.1
  ```
  ```bash
  nano conf/grafana.ini
  ```
  Isi sebagai berikut
    ```ini
    [paths]
    data = ./data
    logs = ./data/log
    plugins = ./data/plugins
    [server]
    http_port = 3000
    domain = 192.168.16.92
    [database]
    [session]
    [analytics]
    check_for_updates = true
    [security]
    admin_user = admin
    admin_password = admin
    [snapshots]
    [users]
    [auth.anonymous]
    [auth.basic]
    [auth.ldap]
    [smtp]
    [emails]
    [log]
    mode = file
    [log.console]
    [log.file]
    level = info
    format = text
    [log.syslog]
    [event_publisher]
    [dashboards.json]
    enabled = false
    path = ./data/dashboards
    [metrics]
    [grafana_net]
    url = https://grafana.net
  ```
* Masuk ke grafana dengan mengakses `192.168.16.92:3000` pada browser
  ![Grafana](/img/grafana.png)
* Login menggunakan username `admin` password `admin`.
* Pada home dashboard click tombol `Create yout first data source`
* Klik `Prometheus` pada `Time series databases`
  ![Grafana](/img/grafana_prometheus.png)
* Masukkan `http://192.168.16.92:9090` pada form URL di bagian HTTP lalu klik `Save & Test`
* Buat dashboard baru dengan cara import lalu masukkan file `grafana/pd.json`, `grafana/tidb.json`, dan `grafana/tikv_summary.json`
* Tampilan Dashboard PD
  ![Grafana PD](/img/grafana-pd.png)
* Tampilan Dashboard TiDB
  ![Grafana TiDB](/img/grafana-tidb.png)
* Tampilan Dashboard TiKV
  ![Grafana TiKV](/img/grafana-tikv.png)