#include "log.h"
#include "logevents.h"

#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>

log::log() {}

void log::setLog(const QByteArray &newLog)
{
    logs = newLog;
    QJsonDocument json_doc = QJsonDocument::fromJson(logs);
    QJsonArray json_array=json_doc.array();

    QVector<logevents> loglist;
    for (const QJsonValue &value : json_array) {
        if (value.isObject()) {
            logevents logev = logevents::mapJson(value.toObject());
            loglist.append(logev);
        }
    }
}
