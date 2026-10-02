# Privacy

Short version: **Viraam cannot send anything anywhere.** It has no internet
permission, so there is no technical path for your data to leave the phone,
even by mistake.

## What it can see

Viraam runs as an Android Accessibility service, with content reading switched
**off** (`canRetrieveWindowContent="false"` in the manifest). What it receives is:

* the package name of the app currently in front, and
* the fact that a scroll happened in it.

That's all. It cannot read text, posts, messages, passwords or anything else on
your screen. It never takes screenshots.

## What it stores, and where

In the app's own private storage, which no other app can read:

* your settings,
* lines you keep with a long press,
* lines you write yourself,
* how full the "drift" level is, when the last pause was, and how many happened today.

Nothing is sent anywhere. There are no accounts, no identifiers, no analytics and
no crash reporting. If you use **Save a copy** in the Your own tab, Viraam writes
a backup file to your Downloads folder — that is the only file it ever creates
outside its own storage, and only when you tap it.

Automatic Android backups are switched off, so your settings and kept lines are
not copied to Google's servers or pulled off the phone by a cable.

## Uninstalling

Removing the app removes everything it stored. Nothing is left behind.
