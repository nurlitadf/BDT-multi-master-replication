# BDT - ETS

1. Desain dan Implementasi Infrastruktur
    * Gambar Infrastruktur
  
    ![alt text](https://github.com/nurlitadf/BDT-multi-master-replication/blob/master/ets.png "Gambar Infrastuktur")
    
    * Jumlah Server
    
      * Database sebanyak 3 buah
      
      * Proxy sebanyak 1 buah
      
      * Web server sebanyak 1 buah
     
    * Spesifikasi Hardware
     
      * Database
        
        * Menggunakan bento/ubuntu-16.04
        * RAM 512MB
        * MySQL
      
      * Proxy
        * Menggunakan bento/ubuntu-16.04
        * RAM 512MB
        * MySQL
    
    * Pembagian IP
    
      * Database
        
        * 192.168.16.92
        * 192.168.16.93
        * 192.168.16.94
        
      * Proxy
        
        * 192.168.16.95
      
      * Webserver
        
        * localhost
