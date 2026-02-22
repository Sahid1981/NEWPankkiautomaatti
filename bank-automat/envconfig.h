#ifndef ENVCONFIG_H
#define ENVCONFIG_H

#include <QString>
#include <QFile>
#include <QTextStream>
#include <QStandardPaths>
#include <QDebug>

class EnvConfig
{
public:
    static void loadEnv()
    {
        // Etsi .env tiedosto käyttäjän kotihakemistosta
        QString homeDir = QStandardPaths::writableLocation(QStandardPaths::HomeLocation);
        QString envPath = homeDir + "/.env";
        
        qDebug() << "Looking for .env at:" << envPath;
        
        QFile file(envPath);
        if (!file.exists()) {
            qWarning() << ".env file not found at" << envPath;
            qWarning() << "Please create ~/.env file with DB_IP configuration";
            return;
        }
        
        if (!file.open(QIODevice::ReadOnly | QIODevice::Text)) {
            qWarning() << "Failed to open .env file";
            return;
        }
        
        QTextStream in(&file);
        while (!in.atEnd()) {
            QString line = in.readLine().trimmed();
            
            // Ohita kommentit ja tyhjät rivit
            if (line.isEmpty() || line.startsWith("#")) {
                continue;
            }
            
            // Parsi KEY=VALUE pareja
            int equalPos = line.indexOf('=');
            if (equalPos > 0) {
                QString key = line.left(equalPos).trimmed();
                QString value = line.mid(equalPos + 1).trimmed();
                
                // Aseta ympäristömuuttuja
                qputenv(key.toUtf8(), value.toUtf8());
                qDebug() << "Loaded:" << key << "=" << value;
            }
        }
        
        file.close();
        qDebug() << ".env file loaded successfully";
    }
    
    // Helperfunktio arvojen hakemiseen
    static QString getEnv(const QString &key, const QString &defaultValue = "")
    {
        QString value = qgetenv(key.toUtf8());
        return value.isEmpty() ? defaultValue : value;
    }
};

#endif // ENVCONFIG_H
