#ifndef LOG_H
#define LOG_H

#include <QDialog>
#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>

class log
{
public:
    log();

    void setLog(const QByteArray &newLog);
private:
    QByteArray logs;
};

#endif // LOG_H
