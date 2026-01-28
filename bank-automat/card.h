#ifndef CARD_H
#define CARD_H

#include <QString>
#include <QJsonObject>

class card
{
public:
    card();
    QString idcard;
    QString cardPIN;
    QString iduser;
    int is_locked;
    static card mapJson(const QJsonObject &json);
};

#endif // CARD_H
