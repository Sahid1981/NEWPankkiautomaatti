#ifndef ACCOUNTS_H
#define ACCOUNTS_H

#include <QString>
#include <QJsonObject>

class accounts
{
public:
    accounts();
    int idAccount;
    QString idUser;
    double balance;
    double creditLimit;
    static accounts mapJson(const QJsonObject &json);
};

#endif // ACCOUNTS_H
