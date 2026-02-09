#ifndef LOGEVENTS_H
#define LOGEVENTS_H

#include <QString>
#include <QJsonObject>

class logevents
{
public:
    logevents();
    int idLog;
    int idAccount;
    QString time;
    double balanceChange;
    static logevents mapJson(const QJsonObject &json);
};

#endif // LOGEVENTS_H
